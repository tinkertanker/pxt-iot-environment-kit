

/**
 * Custom blocks
 */
//% weight=90 color=#ff7a4b icon="\uf0ee" block="Octopus"
namespace Environment {


    export enum DHT11Type {
        //% block="temperature(℃)" enumval=0
        DHT11_temperature_C,

        //% block="temperature(℉)" enumval=1
        DHT11_temperature_F,

        //% block="humidity(0~100)" enumval=2
        DHT11_humidity,
    }


    export enum Distance_Unit {
        //% block="mm" enumval=0
        Distance_Unit_mm,

        //% block="cm" enumval=1
        Distance_Unit_cm,

        //% block="inch" enumval=2
        Distance_Unit_inch,
    }


    export enum BME280Type {
        //% block="temperature(℃)" enumval=0
        BME280_temperature_C,

        //% block="humidity(0~100)" enumval=1
        BME280_humidity,

        //% block="pressure(hPa)" enumval=2
        BME280_pressure,

        //% block="altitude(M)" enumval=3
        BME280_altitude,
    }




    // keep track of services
    //let rainMonitorStarted = false;
    //let windMonitorStarted = false;
    let weatherMonitorStarted = false;
    // Keep Track of weather monitoring variables
    //let numRainDumps = 0
    //let numWindTurns = 0
    //let windMPH = 0

    // BME280 Addresses
    const bmeAddr = 0x76
    const ctrlHum = 0xF2
    const ctrlMeas = 0xF4
    const config = 0xF5
    const pressMSB = 0xF7
    const pressLSB = 0xF8
    const pressXlsb = 0xF9
    const tempMSB = 0xFA
    const tempLSB = 0xFB
    const tempXlsb = 0xFC
    const humMSB = 0xFD
    const humLSB = 0xFE

    // Stores compensation values for Temperature (must be read from BME280 NVM)
    let digT1Val = 0
    let digT2Val = 0
    let digT3Val = 0

    // Stores compensation values for humidity (must be read from BME280 NVM)
    let digH1Val = 0
    let digH2Val = 0
    let digH3Val = 0
    let digH4Val = 0
    let digH5Val = 0
    let digH6Val = 0

    // Buffer to hold pressure compensation values to pass to the C++ compensation function
    let digPBuf: Buffer

    // BME Compensation Parameter Addresses for Temperature
    const digT1 = 0x88
    const digT2 = 0x8A
    const digT3 = 0x8C

    // BME Compensation Parameter Addresses for Pressure
    const digP1 = 0x8E
    const digP2 = 0x90
    const digP3 = 0x92
    const digP4 = 0x94
    const digP5 = 0x96
    const digP6 = 0x98
    const digP7 = 0x9A
    const digP8 = 0x9C
    const digP9 = 0x9E

    // BME Compensation Parameter Addresses for Humidity
    const digH1 = 0xA1
    const digH2 = 0xE1
    const digH3 = 0xE3
    const e5Reg = 0xE5
    const e4Reg = 0xE4
    const e6Reg = 0xE6
    const digH6 = 0xE7

    let Reference_VOLTAGE = 3100

    /**
     * get dust value (μg/m³) 
     * @param vLED describe parameter here, eg: DigitalPin.P16
     * @param vo describe parameter here, eg: AnalogPin.P1
     */
    //% blockId="readdust" block="value of dust(μg/m³) at LED %vLED| out %vo"
    export function ReadDust(vLED: DigitalPin, vo: AnalogPin): number {
        let voltage = 0;
        let dust = 0;
        pins.digitalWritePin(vLED, 0);
        control.waitMicros(160);
        voltage = pins.analogReadPin(vo);
        control.waitMicros(100);
        pins.digitalWritePin(vLED, 1);
        voltage = pins.map(
            voltage,
            0,
            1023,
            0,
            Reference_VOLTAGE / 2 * 3
        );
        dust = (voltage - 380) * 5 / 29;
        if (dust < 0) {
            dust = 0
        }
        return Math.round(dust)

    }


    /**
     * get Ultrasonic(sonar:bit) distance
     * @param distance_unit describe parameter here, eg: 1
     * @param pin describe parameter here, eg: DigitalPin.P16
     */
    //% blockId=readsonarbit block="Ultrasonic distance in unit %distance_unit |at|pin %pin"
    export function sonarbit_distance(distance_unit: Distance_Unit, pin: DigitalPin): number {

        // send pulse
        pins.setPull(pin, PinPullMode.PullNone)
        pins.digitalWritePin(pin, 0)
        control.waitMicros(2)
        pins.digitalWritePin(pin, 1)
        control.waitMicros(10)
        pins.digitalWritePin(pin, 0)

        // read pulse
        let d = pins.pulseIn(pin, PulseValue.High, 23000)  // 8 / 340 = 
        let distance = d * 10 * 5 / 3 / 58

        if (distance > 4000) distance = 0

        switch (distance_unit) {
            case 0:
                return Math.round(distance) //mm
                break
            case 1:
                return Math.round(distance / 10)  //cm
                break
            case 2:
                return Math.round(distance / 25)  //inch
                break
            default:
                return 0

        }

    }



    /**
     * get TMP36 Temperature(℃)
     * @param temppin describe parameter here, eg: AnalogPin.P1
     */
    //% blockId="readtemp" block="read temperature(℃) at pin %temppin"

    /*
    export function ReadTemperature(temppin: AnalogPin): number {
        let voltage = 0;
        let Temperature = 0;
        voltage = pins.map(
            pins.analogReadPin(temppin),
            0,
            1023,
            0,
            reference_voltage
        );
        Temperature = (voltage - 500) / 10;
        return Temperature;
    }
    */

    /**
     * get dht11 temperature and humidity Value
     * @param dht11pin describe parameter here, eg: DigitalPin.P15     */
    //% advanced=true
    //% blockId="readdht11" block="value of dht11 %dht11type| at pin %dht11pin"
    export function temperature(dht11type: DHT11Type, dht11pin: DigitalPin): number {
        pins.digitalWritePin(dht11pin, 0)
        basic.pause(18)
        let i = pins.digitalReadPin(dht11pin)
        pins.setPull(dht11pin, PinPullMode.PullUp);

        while (pins.digitalReadPin(dht11pin) == 1);
        while (pins.digitalReadPin(dht11pin) == 0);
        while (pins.digitalReadPin(dht11pin) == 1);

        let value = 0;
        let counter = 0;
        let error = 0;

        for (let i = 0; i <= 32 - 1; i++) {
            while (pins.digitalReadPin(dht11pin) == 0) {
                //check if the wait is too long, 1000 is arbituary
                counter++;
                if (counter == 1000) {
                    error = 1;
                }
            }
            counter = 0
            while (pins.digitalReadPin(dht11pin) == 1) {
                counter += 1;
            }
            if (counter > 3) {
                value = value + (1 << (31 - i));
                //check if the wait is too long, 1000 is arbituary
                if (counter >= 1000) {
                    error = 2;
                }
            }
        }
        if (error == 1) {
            return 1001;
        }
        else if (error == 2) {
            return 1002;
        }
        else {
            switch (dht11type) {
                case 0:
                    return (value & 0x0000ff00) >> 8
                    break;
                case 1:
                    return ((value & 0x0000ff00) >> 8) * 9 / 5 + 32
                    break;
                case 2:
                    return value >> 24
                    break;
                default:
                    return 0;
            }
        }

    }






    /**
     * get pm2.5 value (μg/m³) 
     * @param pm25pin describe parameter here, eg: DigitalPin.P14
     */
    //% advanced=true
    //% blockId="readpm25" block="value of pm2.5(μg/m³) at pin %pm25pin"
    export function ReadPM25(pm25pin: DigitalPin): number {
        let pm25 = 0
        while (pins.digitalReadPin(pm25pin) != 0) {
        }
        while (pins.digitalReadPin(pm25pin) != 1) {
        }
        pm25 = input.runningTimeMicros()
        while (pins.digitalReadPin(pm25pin) != 0) {
        }
        pm25 = input.runningTimeMicros() - pm25
        pm25 = pm25 / 1000 - 2
        return pm25;
    }



    /**
     * get pm10 value (μg/m³) 
     * @param pm10pin describe parameter here, eg: DigitalPin.P13     
     */
    //% advanced=true
    //% blockId="readpm10" block="value of pm10(μg/m³) at pin %pm10pin"
    export function ReadPM10(pm10pin: DigitalPin): number {
        let pm10 = 0
        while (pins.digitalReadPin(pm10pin) != 0) {
        }
        while (pins.digitalReadPin(pm10pin) != 1) {
        }
        pm10 = input.runningTimeMicros()
        while (pins.digitalReadPin(pm10pin) != 0) {
        }
        pm10 = input.runningTimeMicros() - pm10
        pm10 = pm10 / 1000 - 2
        return pm10;
    }




    /**
     * get soil moisture value (0~100)
     * @param soilmoisturepin describe parameter here, eg: AnalogPin.P1
     */
    //% blockId="readsoilmoisture" block="value of soil moisture(0~100) at pin %soilhumiditypin"
    export function ReadSoilHumidity(soilmoisturepin: AnalogPin): number {
        let voltage = 0;
        let soilmoisture = 0;
        voltage = pins.map(
            pins.analogReadPin(soilmoisturepin),
            0,
            1023,
            0,
            100
        );
        soilmoisture = voltage;
        return Math.round(soilmoisture)
    }


    /**
     * get light intensity value (0~100)
     * @param lightintensitypin describe parameter here, eg: AnalogPin.P1
     */
    //% blockId="readlightintensity" block="value of light intensity(0~100) at pin %lightintensitypin"
    export function ReadLightIntensity(lightintensitypin: AnalogPin): number {
        let voltage = 0;
        let lightintensity = 0;
        voltage = pins.map(
            pins.analogReadPin(lightintensitypin),
            0,
            1023,
            0,
            100
        );
        lightintensity = voltage;
        return Math.round(lightintensity)
    }


    /**
     * get water level value (0~100)
     * @param waterlevelpin describe parameter here, eg: AnalogPin.P1
     */
    //% blockId="readWaterLevel" block="value of water level(0~100) at pin %waterlevelpin"
    export function ReadWaterLevel(waterlevelpin: AnalogPin): number {
        let voltage = 0;
        let waterlevel = 0;
        voltage = pins.map(
            pins.analogReadPin(waterlevelpin),
            0,
            700,
            0,
            100
        );
        waterlevel = voltage;
        return Math.round(waterlevel)
    }



    /**
     * get wind speed value (m/s)
     * @param windspeedpin describe parameter here, eg: AnalogPin.P1
     */
    //% advanced=true
    //% blockId="readwindspeed" block="value of wind speed(m/s) at pin %windspeedpin"
    export function ReadWindSpeed(windspeedpin: AnalogPin): number {
        let voltage = 0;
        let windspeed = 0;
        voltage = pins.map(
            pins.analogReadPin(windspeedpin),
            0,
            1023,
            0,
            Reference_VOLTAGE
        );
        windspeed = voltage / 40;
        return Math.round(windspeed)
    }



    /** 
     * get noise value (dB)
     * @param noisepin describe parameter here, eg: AnalogPin.P1
     */
    //% blockId="readnoise" block="value of noise(dB) at pin %noisepin"
    export function ReadNoise(noisepin: AnalogPin): number {
        let level = 0
        let voltage = 0
        let noise = 0
        let h = 0
        let l = 0
        let sumh = 0
        let suml = 0
        for (let i = 0; i < 1000; i++) {
            level = level + pins.analogReadPin(noisepin)
        }
        level = level / 1000
        for (let i = 0; i < 1000; i++) {
            voltage = pins.analogReadPin(noisepin)
            if (voltage >= level) {
                h += 1
                sumh = sumh + voltage
            } else {
                l += 1
                suml = suml + voltage
            }
        }
        if (h == 0) {
            sumh = level
        } else {
            sumh = sumh / h
        }
        if (l == 0) {
            suml = level
        } else {
            suml = suml / l
        }
        noise = sumh - suml
        if (noise <= 4) {
            noise = pins.map(
                noise,
                0,
                4,
                30,
                50
            )
        } else if (noise <= 8) {
            noise = pins.map(
                noise,
                4,
                8,
                50,
                55
            )
        } else if (noise <= 14) {
            noise = pins.map(
                noise,
                9,
                14,
                55,
                60
            )
        } else if (noise <= 32) {
            noise = pins.map(
                noise,
                15,
                32,
                60,
                70
            )
        } else if (noise <= 60) {
            noise = pins.map(
                noise,
                33,
                60,
                70,
                75
            )
        } else if (noise <= 100) {
            noise = pins.map(
                noise,
                61,
                100,
                75,
                80
            )
        } else if (noise <= 150) {
            noise = pins.map(
                noise,
                101,
                150,
                80,
                85
            )
        } else if (noise <= 231) {
            noise = pins.map(
                noise,
                151,
                231,
                85,
                90
            )
        } else {
            noise = pins.map(
                noise,
                231,
                1023,
                90,
                120
            )
        }
        noise = Math.round(noise)
        return Math.round(noise)
    }


    /***************************************************************************************
     * Functions for interfacing with the BME280
     ***************************************************************************************/



    /**
     * Writes a value to a register on the BME280
     */
    function WriteBMEReg(reg: number, val: number): void {
        pins.i2cWriteNumber(bmeAddr, reg << 8 | val, NumberFormat.Int16BE)
    }

    /**
     * Reads a value from a register on the BME280
     */
    function readBMEReg(reg: number, format: NumberFormat) {
        pins.i2cWriteNumber(bmeAddr, reg, NumberFormat.UInt8LE, false)
        let val = pins.i2cReadNumber(bmeAddr, format, false)
        return val
    }

    /**
     * get BME280 value, temperature, humidity, pressure and altitude can be selected.
     */
    //% blockId="readbme280" block="value of BME280 %bme280type"
    export function getbme280(bme280type: BME280Type): number {
        switch (bme280type) {
            case 0:
                return BME280_temperature()
                break;
            case 1:
                return BME280_humidity()
                break;
            case 2:
                return BME280_pressure()
                break;
            case 3:
                return BME280_altitude()
                break;
            default:
                return 0;
        }

    }

    /**
     * Reads the temp from the BME sensor and uses compensation for calculator temperature.
     * Returns 4 digit number. Value should be devided by 100 to get DegC
     */
    //% weight=43 blockGap=8 blockId="bme280_temperature" block="temperature(C)"
    function BME280_temperature(): number {
        startWeatherMonitoring()

        // Read the temperature registers
        let tempRegM = readBMEReg(tempMSB, NumberFormat.UInt16BE)
        let tempRegL = readBMEReg(tempXlsb, NumberFormat.UInt8LE)

        // Use compensation formula and return result
        //return compensateTemp((tempRegM << 4) | (tempRegL >> 4))
        let bme280_temperature = compensateTemp((tempRegM << 4) | (tempRegL >> 4))
        bme280_temperature = Math.idiv(bme280_temperature, 100)
        return bme280_temperature

    }

    /**
     * Reads the humidity from the BME sensor and uses compensation for calculating humidity.
     * returns a 5 digit number. Value should be divided by 1024 to get % relative humidity. 
     */
    //% weight=41 blockGap=8 blockId="bme280_humidity" block="humidity"
    function BME280_humidity(): number {
        startWeatherMonitoring()

        // Read the pressure registers
        let humReg = readBMEReg(humMSB, NumberFormat.UInt16BE)

        // Compensate and return humidity
        return compensateHumidity(humReg) >> 10
    }

    /**
     * Reads the pressure from the BME sensor and uses compensation for calculating pressure.
     * Returns an 8 digit number. Value should be divided by 25600 to get hPa. 
     */
    //% weight=42 blockGap=8 blockId="bme280_pressure" block="pressure"
    function BME280_pressure(): number {
        startWeatherMonitoring()

        // Read the temperature registers
        let pressRegM = readBMEReg(pressMSB, NumberFormat.UInt16BE)
        let pressRegL = readBMEReg(pressXlsb, NumberFormat.UInt8LE)

        // Compensate and return pressure
        let bme280_pressure = compensatePressure((pressRegM << 4) | (pressRegL >> 4), tFine, digPBuf)
        return Math.idiv(bme280_pressure, 25600) - 30
    }

    /**
     * Sets up BME for in Weather Monitoring Mode.
     */
    //% weight=44 blockGap=8 blockId="bme280_setupBME280" block="start weather monitoring"
    function startWeatherMonitoring(): void {
        if (weatherMonitorStarted) return;

        // The 0xE5 register is 8 bits where 4 bits go to one value and 4 bits go to another
        let e5Val = 0

        // Instantiate buffer that holds the pressure compensation values
        digPBuf = pins.createBuffer(18)

        // Set up the BME in weather monitoring mode
        WriteBMEReg(ctrlHum, 0x01)
        WriteBMEReg(ctrlMeas, 0x27)
        WriteBMEReg(config, 0)

        // Read the temperature registers to do a calculation and set tFine
        let tempRegM = readBMEReg(tempMSB, NumberFormat.UInt16BE)
        let tempRegL = readBMEReg(tempXlsb, NumberFormat.UInt8LE)

        // Get the NVM digital compensations numbers from the device for temp
        digT1Val = readBMEReg(digT1, NumberFormat.UInt16LE)
        digT2Val = readBMEReg(digT2, NumberFormat.Int16LE)
        digT3Val = readBMEReg(digT3, NumberFormat.Int16LE)

        // Get the NVM digital compensation number from the device for pressure and pack into
        // a buffer to pass to the C++ implementation of the compensation formula
        digPBuf.setNumber(NumberFormat.UInt16LE, 0, readBMEReg(digP1, NumberFormat.UInt16LE))
        digPBuf.setNumber(NumberFormat.Int16LE, 2, readBMEReg(digP2, NumberFormat.Int16LE))
        digPBuf.setNumber(NumberFormat.Int16LE, 4, readBMEReg(digP3, NumberFormat.Int16LE))
        digPBuf.setNumber(NumberFormat.Int16LE, 6, readBMEReg(digP4, NumberFormat.Int16LE))
        digPBuf.setNumber(NumberFormat.Int16LE, 8, readBMEReg(digP5, NumberFormat.Int16LE))
        digPBuf.setNumber(NumberFormat.Int16LE, 10, readBMEReg(digP6, NumberFormat.Int16LE))
        digPBuf.setNumber(NumberFormat.Int16LE, 12, readBMEReg(digP7, NumberFormat.Int16LE))
        digPBuf.setNumber(NumberFormat.Int16LE, 14, readBMEReg(digP8, NumberFormat.Int16LE))
        digPBuf.setNumber(NumberFormat.Int16LE, 16, readBMEReg(digP9, NumberFormat.Int16LE))

        // Get the NVM digital compensation number from device for humidity
        e5Val = readBMEReg(e5Reg, NumberFormat.Int8LE)
        digH1Val = readBMEReg(digH1, NumberFormat.UInt8LE)
        digH2Val = readBMEReg(digH2, NumberFormat.Int16LE)
        digH3Val = readBMEReg(digH3, NumberFormat.UInt8LE)
        digH4Val = (readBMEReg(e4Reg, NumberFormat.Int8LE) << 4) | (e5Val & 0xf)
        digH5Val = (readBMEReg(e6Reg, NumberFormat.Int8LE) << 4) | (e5Val >> 4)
        digH6Val = readBMEReg(digH6, NumberFormat.Int8LE)

        // Compensate the temperature to calcule the tFine variable for use in other
        // measurements
        let temp = compensateTemp((tempRegM << 4) | (tempRegL >> 4))

        weatherMonitorStarted = true;
    }

    // Global variable used in all calculations for the BME280
    let tFine = 0

    /**
     * Returns temperature in DegC, resolution is 0.01 DegC. Output value of “5123” equals 51.23 DegC.
     * tFine carries fine temperature as global value
     */
    function compensateTemp(tempRegVal: number): number {
        let firstConv: number = (((tempRegVal >> 3) - (digT1Val << 1)) * digT2Val) >> 11
        let secConv: number = (((((tempRegVal >> 4) - digT1Val) * ((tempRegVal >> 4) - (digT1Val))) >> 12) * (digT3Val)) >> 14
        tFine = firstConv + secConv
        return (tFine * 5 + 128) >> 8
    }

    /**
     * Returns humidity in %RH as unsigned 32 bit integer in Q22.10 format (22 integer and 10 fractional bits).
     * Output value of “47445” represents 47445/1024 = 46.333 %RH
     */
    function compensateHumidity(humRegValue: number): number {
        let hum: number = (tFine - 76800)
        hum = (((((humRegValue << 14) - (digH4Val << 20) - (digH5Val * hum)) + 16384) >> 15) * (((((((hum * digH6Val) >> 10) * (((hum * digH3Val) >> 11) + 32768)) >> 10) + 2097152) * digH2Val + 8192) >> 14))
        hum = hum - (((((hum >> 15) * (hum >> 15)) >> 7) * digH1Val) >> 4)
        hum = (hum < 0 ? 0 : hum)
        hum = (hum > 419430400 ? 419430400 : hum)
        return (hum >> 12)
    }

    /**
     * Function used for simulator, actual implementation is in bme280.cpp
     */
    //% shim=Environment::compensatePressure
    function compensatePressure(pressRegVal: number, tFine: number, compensation: Buffer) {
        // Fake function for simulator
        return 0
    }

    /**
   * Reads the pressure from the BME sensor and uses compensation for calculating pressure.
   * Returns altitude in meters based on pressure at sea level. (absolute altitude)
   */
    //% weight=40 blockGap=28 blockId="bme280_altitude" block="altitude(M)"
    function BME280_altitude(): number {
        startWeatherMonitoring();

        let pressRegM = readBMEReg(pressMSB, NumberFormat.UInt16BE)
        let pressRegL = readBMEReg(pressXlsb, NumberFormat.UInt8LE)
        return calcAltitude((pressRegM << 4) | (pressRegL >> 4), tFine, digPBuf)
    }

    /**
     * Function used for simulator, actual implementation is in bme280.cpp
     */
    //% shim=Environment::calcAltitude
    function calcAltitude(pressRegVal: number, tFine: number, compensation: Buffer) {
        // Fake function for simulator
        return 0
    }


}

