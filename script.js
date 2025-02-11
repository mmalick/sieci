class IPAddress {
    constructor(octets) {
      this.octets = octets;
    }
    
    static fromString(ipString) {
      const octets = ipString.split('.').map(Number);
      return new IPAddress(octets);
    }
    
    static fromInt32(number) {
      return new IPAddress([
        (number >>> 24) & 0xFF,
        (number >>> 16) & 0xFF,
        (number >>> 8) & 0xFF,
        number & 0xFF
      ]);
    }
    
    static combine(baseIP, offsetIP) {
      const combined = baseIP.toInt32() | offsetIP.toInt32();
      return IPAddress.fromInt32(combined);
    }
    
    getClass() {
      const first = this.octets[0];
      if (first >= 1 && first <= 126) return "A";
      if (first >= 128 && first <= 191) return "B";
      if (first >= 192 && first <= 223) return "C";
      throw new Error("Unsupported IP address class");
    }
    
    getClassByteOffset() {
      switch (this.getClass()) {
        case "A": return 1;
        case "B": return 2;
        case "C": return 3;
        default: throw new Error("Invalid IP address class");
      }
    }
    
    applyMask(mask) {
      for (let i = 0; i < 4; i++) {
        this.octets[i] &= mask.octets[i];
      }
    }
    
    toInt32() {
      return (this.octets[0] << 24) | (this.octets[1] << 16) | (this.octets[2] << 8) | this.octets[3];
    }
    
    toBinaryString() {
      return this.octets.map(octet => octet.toString(2).padStart(8, '0')).join('.');
    }
    
    toString() {
      return this.octets.join('.');
    }
  }
  
  const getNetworkMask = (ipClass) => {
    switch(ipClass) {
      case "A": return IPAddress.fromString("255.0.0.0");
      case "B": return IPAddress.fromString("255.255.0.0");
      case "C": return IPAddress.fromString("255.255.255.0");
      default: throw new Error("Invalid IP address class");
    }
  };
  
  const getHostBitCount = (requiredHostCount) => Math.ceil(Math.log2(requiredHostCount + 2));
  
  const getSubnetMask = (hostBitCount) => IPAddress.fromInt32(~0 << hostBitCount);
  
  const getBroadcast = (hostBitCount) => IPAddress.fromInt32(~(~0 << hostBitCount));
  
  const getFirstHostOffset = () => IPAddress.fromInt32(1);
  const getLastHostOffset = (hostBitCount) => IPAddress.fromInt32(getBroadcast(hostBitCount).toInt32() - 1);
  
  const getSubnetCount = (ipAddress, hostBitCount) => {
    const classOffset = ipAddress.getClassByteOffset() * 8;
    return 1 << (32 - classOffset - hostBitCount);
  };
  
  const getHostCount = (hostBitCount) => (1 << hostBitCount) - 2;
  
  const getFirstSubnet = (baseIP) => baseIP;
  
  const getSecondSubnet = (baseIP, hostBitCount) => {
    const offset = IPAddress.fromInt32(1 << hostBitCount);
    return IPAddress.combine(baseIP, offset);
  };
  
  const getLastSubnet = (baseIP, hostBitCount) => {
    const leftMask = ~0 << hostBitCount;
    const rightMask = ~0 >>> (baseIP.getClassByteOffset() * 8);
    const offset = IPAddress.fromInt32(leftMask & rightMask);
    return IPAddress.combine(baseIP, offset);
  };
  
  function calculateSubnets() {
    const ipAddress = ui.getIP();
    const requiredHostCount = ui.getRequiredHostCount();
    
    const ipClass = ipAddress.getClass();
    const networkMask = getNetworkMask(ipClass);
    const hostBitCount = getHostBitCount(requiredHostCount);
    const subnetMask = getSubnetMask(hostBitCount);
    const broadcast = getBroadcast(hostBitCount);
    const firstHostOffset = getFirstHostOffset();
    const lastHostOffset = getLastHostOffset(hostBitCount);
    
    const firstSubnet = getFirstSubnet(ipAddress);
    const firstSubnetBroadcast = IPAddress.combine(firstSubnet, broadcast);
    const firstSubnetFirstHost = IPAddress.combine(firstSubnet, firstHostOffset);
    const firstSubnetLastHost = IPAddress.combine(firstSubnet, lastHostOffset);
    
    const secondSubnet = getSecondSubnet(ipAddress, hostBitCount);
    const secondSubnetBroadcast = IPAddress.combine(secondSubnet, broadcast);
    const secondSubnetFirstHost = IPAddress.combine(secondSubnet, firstHostOffset);
    const secondSubnetLastHost = IPAddress.combine(secondSubnet, lastHostOffset);
    
    const lastSubnet = getLastSubnet(ipAddress, hostBitCount);
    const lastSubnetBroadcast = IPAddress.combine(lastSubnet, broadcast);
    const lastSubnetFirstHost = IPAddress.combine(lastSubnet, firstHostOffset);
    const lastSubnetLastHost = IPAddress.combine(lastSubnet, lastHostOffset);
    
    const subnetCount = getSubnetCount(ipAddress, hostBitCount);
    const hostCount = getHostCount(hostBitCount);
    
    ui.setAddressClass(ipClass);
    ui.setNetworkMask(networkMask.toString());
    ui.setHostBitCount(hostBitCount);
    ui.setSubnetMask(subnetMask.toString());
    ui.setBinarySubnetMask(subnetMask.toBinaryString());
    ui.setFirstSubnet(firstSubnet.toString());
    ui.setFirstSubnetBroadcast(firstSubnetBroadcast.toString());
    ui.setFirstSubnetFirstHost(firstSubnetFirstHost.toString());
    ui.setFirstSubnetLastHost(firstSubnetLastHost.toString());
    ui.setSecondSubnet(secondSubnet.toString());
    ui.setSecondSubnetBroadcast(secondSubnetBroadcast.toString());
    ui.setSecondSubnetFirstHost(secondSubnetFirstHost.toString());
    ui.setSecondSubnetLastHost(secondSubnetLastHost.toString());
    ui.setLastSubnet(lastSubnet.toString());
    ui.setLastSubnetBroadcast(lastSubnetBroadcast.toString());
    ui.setLastSubnetFirstHost(lastSubnetFirstHost.toString());
    ui.setLastSubnetLastHost(lastSubnetLastHost.toString());
    ui.setSubnetCount(subnetCount);
    ui.setHostCount(hostCount);
  }
  
  function calculateVLSM() {
    const baseIP = ui.getIP();
    let subnetAddressOffset = 0;
    
    for (let i = 0; i < 5; i++) {
      const requiredHosts = ui.getVLSMHostCount(i);
      const hostBitCount = getHostBitCount(requiredHosts);
      const subnetIP = IPAddress.combine(baseIP, IPAddress.fromInt32(subnetAddressOffset));
      const mask = getSubnetMask(hostBitCount);
      const firstHost = IPAddress.combine(subnetIP, getFirstHostOffset());
      const lastHost = IPAddress.combine(subnetIP, getLastHostOffset(hostBitCount));
      const broadcast = IPAddress.combine(subnetIP, getBroadcast(hostBitCount));
      
      ui.setVLSMSubnet(i, subnetIP.toString());
      ui.setVLSMMask(i, mask.toString());
      ui.setVLSMFirstHost(i, firstHost.toString());
      ui.setVLSMLastHost(i, lastHost.toString());
      ui.setVLSMBroadcast(i, broadcast.toString());
      
      subnetAddressOffset += 1 << hostBitCount;
    }
  }
  
  function calculate() {
    calculateSubnets();
    calculateVLSM();
  }
  
  const ui = {
    getIP: () => IPAddress.fromString(document.getElementById('ip').value),
    getRequiredHostCount: () => Number(document.getElementById('requiredHostCount').value),
    setAddressClass: (value) => document.getElementById('addressClass').value = value,
    setNetworkMask: (value) => document.getElementById('networkMask').value = value,
    setHostBitCount: (value) => document.getElementById('hostBitCount').value = value,
    setSubnetMask: (value) => document.getElementById('subnetMask').value = value,
    setBinarySubnetMask: (value) => document.getElementById('binarySubnetMask').value = value,
    setFirstSubnet: (value) => document.getElementById('firstSubnet').value = value,
    setFirstSubnetBroadcast: (value) => document.getElementById('firstSubnetBroadcast').value = value,
    setFirstSubnetFirstHost: (value) => document.getElementById('firstSubnetFirstHost').value = value,
    setFirstSubnetLastHost: (value) => document.getElementById('firstSubnetLastHost').value = value,
    setSecondSubnet: (value) => document.getElementById('secondSubnet').value = value,
    setSecondSubnetBroadcast: (value) => document.getElementById('secondSubnetBroadcast').value = value,
    setSecondSubnetFirstHost: (value) => document.getElementById('secondSubnetFirstHost').value = value,
    setSecondSubnetLastHost: (value) => document.getElementById('secondSubnetLastHost').value = value,
    setLastSubnet: (value) => document.getElementById('lastSubnet').value = value,
    setLastSubnetBroadcast: (value) => document.getElementById('lastSubnetBroadcast').value = value,
    setLastSubnetFirstHost: (value) => document.getElementById('lastSubnetFirstHost').value = value,
    setLastSubnetLastHost: (value) => document.getElementById('lastSubnetLastHost').value = value,
    setSubnetCount: (value) => document.getElementById('subnetCount').value = value,
    setHostCount: (value) => document.getElementById('hostCount').value = value,
    getVLSMHostCount: (index) => Number(document.getElementById(`vlsmHostCount${index}`).value),
    setVLSMSubnet: (index, value) => document.getElementById(`vlsmSubnet${index}`).value = value,
    setVLSMMask: (index, value) => document.getElementById(`vlsmMask${index}`).value = value,
    setVLSMFirstHost: (index, value) => document.getElementById(`vlsmFirstHost${index}`).value = value,
    setVLSMLastHost: (index, value) => document.getElementById(`vlsmLastHost${index}`).value = value,
    setVLSMBroadcast: (index, value) => document.getElementById(`vlsmBroadcast${index}`).value = value,
    
    createVLSMTable: () => {
      const vlsmTable = document.getElementById('vlsmTable');
      vlsmTable.innerHTML = '';
      for (let i = 0; i < 5; i++) {
        const row = vlsmTable.insertRow();
        const ids = [
          `vlsmHostCount${i}`, 
          `vlsmSubnet${i}`, 
          `vlsmMask${i}`, 
          `vlsmFirstHost${i}`, 
          `vlsmLastHost${i}`, 
          `vlsmBroadcast${i}`
        ];
        const types = ["number", "text", "text", "text", "text", "text"];
    
        ids.forEach((id, index) => {
          const cell = row.insertCell();
          const input = document.createElement('input');
          input.id = id;
          input.type = types[index];
          cell.appendChild(input);
        });
      }
    }
  };
  
  window.addEventListener('load', () => {
    ui.createVLSMTable();
    
    document.getElementById('calculateBtn').addEventListener('click', calculate);
  });
  
