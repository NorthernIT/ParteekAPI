// all decoder helper functions will be written in this file:

// function to convert a string of hex to array of hext bytes our decoders will take
async function convertHexStringToArray(hexString) {
    var hexArray = [];
    for (var i = 0; i < hexString.length; i += 2) {
        hexArray.push(parseInt(hexString.substr(i, 2), 16));
    }
    return hexArray;
  }

// Dragino decoder function:
async function draginoDecoder(bytes,port){
    // Decode an uplink message from a buffer
    // (array) of bytes to an object of fields.
    var value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
    var batV = value / 1000; //Battery,units:V
    value = (bytes[2] << 8) | bytes[3];
    if (bytes[2] & 0x80) {
        value |= 0xffff0000;
    }
    var temp_SHT = (value / 100).toFixed(2); //SHT20,temperature,units:℃
    value = (bytes[4] << 8) | bytes[5];
    var hum_SHT = (value / 10).toFixed(1); //SHT20,Humidity,units:%
    value = (bytes[7] << 8) | bytes[8];
    if (bytes[7] & 0x80) {
        value |= 0xffff0000;
    }
    var temp_ds = (value / 100).toFixed(2); //DS18B20,temperature,units:℃
    return {
        BatV: batV,
        TempC_DS: temp_ds,
        TempC_SHT: temp_SHT,
        Hum_SHT: hum_SHT,
    };
}

module.exports = {
    draginoDecoder,
    convertHexStringToArray,
}