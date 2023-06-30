let getIP;
let getRequiredHostCount;
let setAddressClass;
let setNetworkMask;
let setHostBitCount;
let setSubnetMask;
let setBinarySubnetMask;
let setFirstSubnet;
let setFirstSubnetBroadcast;
let setFirstSubnetFirstHost;
let setFirstSubnetLastHost;
let setSecondSubnet;
let setSecondSubnetBroadcast;
let setSecondSubnetFirstHost;
let setSecondSubnetLastHost;
let setLastSubnet;
let setLastSubnetBroadcast;
let setLastSubnetFirstHost;
let setLastSubnetLastHost;
let setSubnetCount;
let setHostCount;
let getVLSMHostCount;
let setVLSMSubnet;
let setVLSMMask;
let setVLSMFirstHost;
let setVLSMLastHost;
let setVLSMBroadcast;

class IPAddress {
    constructor(octets) {
        this.octets = octets;
    }
    static fromString(ipString) {
        return new IPAddress(ipString.split('.').map(o => Number.parseInt(o)));
    }
    static fromInt32(number) {
        return new IPAddress([(number & 0xFF000000) >>> 24, (number & 0xFF0000) >>> 16, (number & 0xFF00) >>> 8, number & 0xFF]);
    }
    static combine(ipFirst, ipSecond) {
        return IPAddress.fromInt32(ipFirst.toInt32() | ipSecond.toInt32());
    }
    getClass = () => {
        if (this.octets[1] == "0") {
            return "A";
        }
        if (this.octets[2] == "0") {
            return "B";
        }
        if (this.octets[3] == "0") {
            return "C";
        }
        throw new Error("Unknown address class");
    }
    getClassByteOffset = () => {
        switch (this.getClass()) {
            case "A":
                return 1;
            case "B":
                return 2;
            case "C":
                return 3;
            default:
                throw new Error("Invalid address class");
        }
    }
    applyMask = (mask) => {
        for (let i = 0; i != 4; ++i) {
            octet[i] &= mask;
        }
    }
    toInt32 = () => this.octets[0] << 24 | this.octets[1] << 16 | this.octets[2] << 8 | this.octets[3];
    toBinaryString = () => `${dec2bin(this.octets[0])}.${dec2bin(this.octets[1])}.${dec2bin(this.octets[2])}.${dec2bin(this.octets[3])}`; 
    toString = () => this.octets.join('.');
}

const dec2bin = (number) => number.toString(2).padStart(8, "0");

const bin2dec = (number) => Number.parseInt(number, 2);

const getNetworkMask = (ipAddressClass) => {
    switch (ipAddressClass) {
        case "A":
            return IPAddress.fromString("255.0.0.0");
        case "B":
            return IPAddress.fromString("255.255.0.0");
        case "C":
            return IPAddress.fromString("255.255.255.0");
        default:
            throw new Error("Invalid IP address class");
    }
}

const getHostBitCount = (requiredHostCount) => Math.ceil(Math.log2(requiredHostCount + 2));

const getSubnetByteOffset = (addressClass) => {
    switch (addressClass) {
        case "A": return 1;
        case "B": return 2;
        case "C": return 3;
        default: throw new Error("Invalid address class");
    }
}

const getSubnetMask = (hostBitCount) => {
    return IPAddress.fromInt32(~0 << hostBitCount);
}

const getFirstSubnet = (ipAddress) => {
    return ipAddress;
}

const getSecondSubnet = (ipAddress, hostBitCount) => {
    const secondSubnet = IPAddress.fromInt32(1 << hostBitCount);
    return IPAddress.combine(ipAddress, secondSubnet);
}

const getLastSubnet = (ipAddress, hostBitCount) => {
    const leftMask = ~0 << hostBitCount;
    const rightMask = ~0 >>> ipAddress.getClassByteOffset() * 8;
    const lastSubnet = IPAddress.fromInt32(leftMask & rightMask);
    return IPAddress.combine(ipAddress, lastSubnet);
}

const getBroadcast = (hostBitCount) => IPAddress.fromInt32(~(~0 << hostBitCount));

const getFirstHost = () => IPAddress.fromInt32(1);

const getLastHost = (hostBitCount) => IPAddress.fromInt32(getBroadcast(hostBitCount).toInt32() - 1);

const getSubnetCount = (ipAddress, hostBitCount) => {
    return 1 << (32 - ipAddress.getClassByteOffset() * 8 - hostBitCount);
}

const getHostCount = (hostBitCount) => {
    return (1 << hostBitCount) - 2;
}

function solvePart1() {
    const ipAddress = getIP();
    const requiredHostCount = getRequiredHostCount();
    const addressClass = ipAddress.getClass();
    const networkMask = getNetworkMask(addressClass);
    const hostBitCount = getHostBitCount(requiredHostCount);
    const subnetMask = getSubnetMask(hostBitCount);
    const broadcast = getBroadcast(hostBitCount);
    const firstHost = getFirstHost();
    const lastHost = getLastHost(hostBitCount);
    const firstSubnet = getFirstSubnet(ipAddress);
    const firstSubnetBroadcast = IPAddress.combine(firstSubnet, broadcast);
    const firstSubnetFirstHost = IPAddress.combine(firstSubnet, firstHost);
    const firstSubnetLastHost = IPAddress.combine(firstSubnet, lastHost);
    const secondSubnet = getSecondSubnet(ipAddress, hostBitCount);
    const secondSubnetBroadcast = IPAddress.combine(secondSubnet, broadcast);
    const secondSubnetFirstHost = IPAddress.combine(secondSubnet, firstHost);
    const secondSubnetLastHost = IPAddress.combine(secondSubnet, lastHost);
    const lastSubnet = getLastSubnet(ipAddress, hostBitCount);
    const lastSubnetBroadcast = IPAddress.combine(lastSubnet, broadcast);
    const lastSubnetFirstHost = IPAddress.combine(lastSubnet, firstHost);
    const lastSubnetLastHost = IPAddress.combine(lastSubnet, lastHost);
    const subnetCount = getSubnetCount(ipAddress, hostBitCount);
    const hostCount = getHostCount(hostBitCount);

    setAddressClass(addressClass);
    setNetworkMask(networkMask)
    setHostBitCount(hostBitCount);
    setSubnetMask(subnetMask);
    setBinarySubnetMask(subnetMask.toBinaryString());
    setFirstSubnet(firstSubnet);
    setFirstSubnetBroadcast(firstSubnetBroadcast);
    setFirstSubnetFirstHost(firstSubnetFirstHost);
    setFirstSubnetLastHost(firstSubnetLastHost);
    setSecondSubnet(secondSubnet);
    setSecondSubnetBroadcast(secondSubnetBroadcast);
    setSecondSubnetFirstHost(secondSubnetFirstHost);
    setSecondSubnetLastHost(secondSubnetLastHost);
    setLastSubnet(lastSubnet);
    setLastSubnetBroadcast(lastSubnetBroadcast);
    setLastSubnetFirstHost(lastSubnetFirstHost);
    setLastSubnetLastHost(lastSubnetLastHost);
    setSubnetCount(subnetCount);
    setHostCount(hostCount);
}

function solvePart2() {
    const ipAddress = getIP();
    let subnetAddress = 0;

    for (let i = 0; i != 5; ++i) {
        const hostCount = getVLSMHostCount(i);
        const hostBitCount = getHostBitCount(hostCount);

        const subnetIP = IPAddress.combine(ipAddress, IPAddress.fromInt32(subnetAddress));
        const mask = getSubnetMask(hostBitCount);
        const firstHost = IPAddress.combine(subnetIP, getFirstHost());
        const lastHost = IPAddress.combine(subnetIP, getLastHost(hostBitCount));
        const broadcast = IPAddress.combine(subnetIP, getBroadcast(hostBitCount));
        
        setVLSMSubnet(i, subnetIP);
        setVLSMMask(i, mask);
        setVLSMFirstHost(i, firstHost);
        setVLSMLastHost(i, lastHost);
        setVLSMBroadcast(i, broadcast);

        subnetAddress += 1 << hostBitCount;
    }
}

function calculate() {
    solvePart1();
    solvePart2();
}

function createVLSMTable() {
    const vlsmTable = document.getElementById('vlsmTable');

    for (let i = 0; i != 5; ++i) {
        const row = vlsmTable.insertRow();
        const ids = [`vlsmHostCount${i}`, `vlsmSubnet${i}`, `vlsmMask${i}`, `vlsmFirstHost${i}`, `vlsmLastHost${i}`, `vlsmBroadcast${i}`];
        const types = ["number", "text", "text", "text", "text", "text"];

        for (let j = 0; j != 6; ++j) {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.id = ids[j];
            input.type = types[j];
            cell.appendChild(input);
        }
    }
}

window.onload = () => {
    getIP = () => IPAddress.fromString(document.getElementById('ip').value);
    getRequiredHostCount = () => document.getElementById('requiredHostCount').valueAsNumber;
    setAddressClass = (value) => document.getElementById('addressClass').value = value;
    setNetworkMask = (value) => document.getElementById('networkMask').value = value;
    setHostBitCount = (value) => document.getElementById('hostBitCount').value = value;
    setSubnetMask = (value) => document.getElementById('subnetMask').value = value;
    setBinarySubnetMask = (value) => document.getElementById('binarySubnetMask').value = value;
    setFirstSubnet = (value) => document.getElementById('firstSubnet').value = value;
    setFirstSubnetBroadcast = (value) => document.getElementById('firstSubnetBroadcast').value = value;
    setFirstSubnetFirstHost = (value) => document.getElementById('firstSubnetFirstHost').value = value;
    setFirstSubnetLastHost = (value) => document.getElementById('firstSubnetLastHost').value = value;
    setSecondSubnet = (value) => document.getElementById('secondSubnet').value = value;
    setSecondSubnetBroadcast = (value) => document.getElementById('secondSubnetBroadcast').value = value;
    setSecondSubnetFirstHost = (value) => document.getElementById('secondSubnetFirstHost').value = value;
    setSecondSubnetLastHost = (value) => document.getElementById('secondSubnetLastHost').value = value;
    setLastSubnet = (value) => document.getElementById('lastSubnet').value = value;
    setLastSubnetBroadcast = (value) => document.getElementById('lastSubnetBroadcast').value = value;
    setLastSubnetFirstHost = (value) => document.getElementById('lastSubnetFirstHost').value = value;
    setLastSubnetLastHost = (value) => document.getElementById('lastSubnetLastHost').value = value;
    setSubnetCount = (value) => document.getElementById('subnetCount').value = value;
    setHostCount = (value) => document.getElementById('hostCount').value = value;
    getVLSMHostCount = (i) => document.getElementById(`vlsmHostCount${i}`).valueAsNumber;
    setVLSMSubnet = (i, value) => document.getElementById(`vlsmSubnet${i}`).value = value;
    setVLSMMask = (i, value) => document.getElementById(`vlsmMask${i}`).value = value;
    setVLSMFirstHost = (i, value) => document.getElementById(`vlsmFirstHost${i}`).value = value;
    setVLSMLastHost = (i, value) => document.getElementById(`vlsmLastHost${i}`).value = value;
    setVLSMBroadcast = (i, value) => document.getElementById(`vlsmBroadcast${i}`).value = value;

    createVLSMTable();
}