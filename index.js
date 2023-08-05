const fs = require("fs");
const { SerialPort } = require("serialport");

const port = new SerialPort({
  path: "COM4",
  baudRate: 9600,
});

const csvFilePath = "data.csv";
const csvStream = fs.createWriteStream(csvFilePath, { flags: "a" }); // 'a' stands for append mode

port.on("readable", function () {
  const data = port.read();
  const decodedData = data.toString("utf-8").trim();
  const regex =
    /\$:(-?\d+\.\d+),(-?\d+\.\d+),(-?\d+\.\d+),(-?\d+\.\d+),(-?\d+\.\d+),(-?\d+\.\d+),(-?\d+\.\d+),(-?\d+\.\d+),(-?\d+\.\d+)/;

  const match = decodedData.match(regex);

  if (match) {
    const [
      _,
      gyro_x,
      gyro_y,
      gyro_z,
      accel_x,
      accel_y,
      accel_z,
      mag_x,
      mag_y,
      mag_z,
    ] = match;
    const now = new Date();
    const currentTime = now.toLocaleString();

    const csvLine = `${gyro_x},${gyro_y},${gyro_z},${accel_x},${accel_y},${accel_z},${mag_x},${mag_y},${mag_z},${currentTime}\n`;

    csvStream.write(csvLine, (err) => {
      if (err) {
        console.error("Error writing to CSV:", err);
      } else {
        // Log the received data
        console.log("Received data:", decodedData);
      }
    });
  } else if (decodedData !== "") {
    console.error("Invalid data received:", decodedData);
  }
});

csvStream.on("error", (err) => {
  console.error("Error writing to CSV:", err);
});

// Close the CSV file when the program exits
port.on("close", () => {
  csvStream.close();
});
