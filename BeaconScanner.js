const fs = require('fs');

const BeaconScanner = require('node-beacon-scanner');
const scanner = new BeaconScanner();
 
// Set an Event handler for becons
scanner.onadvertisement = (ad) => {
        const adv = JSON.stringify(ad, null, '  ');
        const parsed = JSON.parse(adv);
        
        const rssi = parsed["rssi"];
        const txPower = get_txPower(parsed);
        const distance = calculate_distance(rssi, txPower);

        if (distance < 5) {
                var det_date = new Date(Date.now());
                try {
                    const last = fs.readFileSync('last_detection.json');
                    check_time(parsed["iBeacon"]["uuid"], det_date, last);
                } catch (err) {
                    update_file(parsed["iBeacon"]["uuid"], det_date);
                }
        }
};

function get_txPower(parsed) {
    switch (parsed["beaconType"]) {
        case "iBeacon":
            return parsed["iBeacon"]["txPower"];
        case "eddystoneUid":
            return parsed["eddystoneUid"]["txPower"];
        case "eddystoneUrl":
            return parsed["eddystoneUrl"]["txPower"];
        case "eddystoneEid":
            return parsed["eddystoneEid"]["txPower"];
    }
}

function calculate_distance(rssi, txPower) {
        const ratio = (txPower - rssi) / 40;
        const distance = Math.pow(10, ratio);
        return distance;
}

function check_time(uuid, det_date, last) {

    // read last detection data
    const parsed = JSON.parse(last);

    const last_date = Date.parse(parsed["date-time"]);
    const diff = (det_date - last_date)/6000;

    if (uuid != parsed["uuid"] || diff > 5) {
        update_file(uuid, det_date);
    }
}

function update_file(uuid, det_date) {
    var dict = {"uuid": uuid,
                "date-time": det_date.toISOString()};
    let dictj = JSON.stringify(dict);

    console.log("--------------");
    console.log("Danger detected")
    fs.writeFile("./last_detection.json", dictj, (err) => {
    if (err)
            console.log(err);
    else {
            console.log("File upgrated successfully\n");
    }});
    console.log("uuid: ", uuid);
    console.log("beaconType: ", "iBeacon");
    console.log("date-time: ", det_date.toISOString())
    // console.log("distance: ", distance);
    // console.log("rssi: ", rssi);
}


// Start scanning
scanner.startScan().then(() => {
        console.log('Scanning BLE beacon...');
}).catch((error) => {
        console.error(error);
});
