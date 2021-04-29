/**
 * Custom blocks
 */
//% color=#ff7a4b icon="\uf0ee" block="Octopus"
namespace Environment {

    let weatherMonitorStarted = false;
    // BME280 Addresses
    let BME280_I2C_ADDR = 0x76
    let dig_T1 = getUInt16LE(0x88)
    let dig_T2 = getInt16LE(0x8A)
    let dig_T3 = getInt16LE(0x8C)
    let dig_P1 = getUInt16LE(0x8E)
    let dig_P2 = getInt16LE(0x90)
    let dig_P3 = getInt16LE(0x92)
    let dig_P4 = getInt16LE(0x94)
    let dig_P5 = getInt16LE(0x96)
    let dig_P6 = getInt16LE(0x98)
    let dig_P7 = getInt16LE(0x9A)
    let dig_P8 = getInt16LE(0x9C)
    let dig_P9 = getInt16LE(0x9E)
    let dig_H1 = getreg(0xA1)
    let dig_H2 = getInt16LE(0xE1)
    let dig_H3 = getreg(0xE3)
    let a = getreg(0xE5)
    let dig_H4 = (getreg(0xE4) << 4) + (a % 16)
    let dig_H5 = (getreg(0xE6) << 4) + (a >> 4)
    let dig_H6 = getInt8LE(0xE7)
    let T = 0
    let P = 0
    let H = 0
    setreg(0xF2, 0x04)
    setreg(0xF4, 0x2F)
    setreg(0xF5, 0x0C)
    setreg(0xF4, 0x2F)

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


    export enum BME280_state {
        //% block="temperature(℃)" enumval=0
        BME280_temperature_C,

        //% block="humidity(0~100)" enumval=1
        BME280_humidity,

        //% block="pressure(hPa)" enumval=2
        BME280_pressure,

        //% block="altitude(M)" enumval=3
        BME280_altitude,
    }
	

    function setreg(reg: number, dat: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = dat;
        pins.i2cWriteBuffer(BME280_I2C_ADDR, buf);
    }

    function getreg(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.UInt8BE);
    }

    function getInt8LE(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.Int8LE);
    }

    function getUInt16LE(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.UInt16LE);
    }

    function getInt16LE(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.Int16LE);
    }
    function get(): void {
        let adc_T = (getreg(0xFA) << 12) + (getreg(0xFB) << 4) + (getreg(0xFC) >> 4)
        let var1 = (((adc_T >> 3) - (dig_T1 << 1)) * dig_T2) >> 11
        let var2 = (((((adc_T >> 4) - dig_T1) * ((adc_T >> 4) - dig_T1)) >> 12) * dig_T3) >> 14
        let t = var1 + var2
        T = ((t * 5 + 128) >> 8) / 100
        var1 = (t >> 1) - 64000
        var2 = (((var1 >> 2) * (var1 >> 2)) >> 11) * dig_P6
        var2 = var2 + ((var1 * dig_P5) << 1)
        var2 = (var2 >> 2) + (dig_P4 << 16)
        var1 = (((dig_P3 * ((var1 >> 2) * (var1 >> 2)) >> 13) >> 3) + (((dig_P2) * var1) >> 1)) >> 18
        var1 = ((32768 + var1) * dig_P1) >> 15
        if (var1 == 0)
            return; // avoid exception caused by division by zero
        let adc_P = (getreg(0xF7) << 12) + (getreg(0xF8) << 4) + (getreg(0xF9) >> 4)
        let _p = ((1048576 - adc_P) - (var2 >> 12)) * 3125
        _p = (_p / var1) * 2;
        var1 = (dig_P9 * (((_p >> 3) * (_p >> 3)) >> 13)) >> 12
        var2 = (((_p >> 2)) * dig_P8) >> 13
        P = _p + ((var1 + var2 + dig_P7) >> 4)
        let adc_H = (getreg(0xFD) << 8) + getreg(0xFE)
        var1 = t - 76800
        var2 = (((adc_H << 14) - (dig_H4 << 20) - (dig_H5 * var1)) + 16384) >> 15
        var1 = var2 * (((((((var1 * dig_H6) >> 10) * (((var1 * dig_H3) >> 11) + 32768)) >> 10) + 2097152) * dig_H2 + 8192) >> 14)
        var2 = var1 - (((((var1 >> 15) * (var1 >> 15)) >> 7) * dig_H1) >> 4)
        if (var2 < 0) var2 = 0
        if (var2 > 419430400) var2 = 419430400
        H = (var2 >> 12) / 1024
    }
let sc_byte = 0
    let dat = 0
    let low = 0
    let high = 0
    let temp = 0
    let temperature = 0
    let ack = 0
    let lastTemp = 0
    export enum ValType {
        //% block="temperature(℃)" enumval=0
        DS18B20_temperature_C,

        //% block="temperature(℉)" enumval=1
        DS18B20_temperature_F
    }
    function init_18b20(mpin:DigitalPin) {
        pins.digitalWritePin(mpin, 0)
        control.waitMicros(600)
        pins.digitalWritePin(mpin, 1)
        control.waitMicros(30)
        ack = pins.digitalReadPin(mpin)
        control.waitMicros(600)
        return ack
    }
    function write_18b20 (mpin:DigitalPin,data: number) {
        sc_byte = 0x01
        for (let index = 0; index < 8; index++) {
            pins.digitalWritePin(mpin, 0)
            if (data & sc_byte) {
                pins.digitalWritePin(mpin, 1)
                control.waitMicros(60)
            } else {
                pins.digitalWritePin(mpin, 0)
                control.waitMicros(60)
            }
            pins.digitalWritePin(mpin, 1)
            data = data >> 1
        }
    }
    function read_18b20 (mpin:DigitalPin) {
        dat = 0x00
        sc_byte = 0x01
        for (let index = 0; index < 8; index++) {
            pins.digitalWritePin(mpin, 0)
            pins.digitalWritePin(mpin, 1)
            if (pins.digitalReadPin(mpin)) {
                dat = dat + sc_byte
            }
            sc_byte = sc_byte << 1
            control.waitMicros(60)
        }
        return dat
    }
    //% block="value of DS18B20 %state at pin %pin"
    export function Ds18b20Temp(pin:DigitalPin,state:ValType):number{
        init_18b20(pin)
        write_18b20(pin,0xCC)
        write_18b20(pin,0x44)
        basic.pause(10)
        init_18b20(pin)
        write_18b20(pin,0xCC)
        write_18b20(pin,0xBE)
        low = read_18b20(pin)
        high = read_18b20(pin)
        temperature = high << 8 | low
        temperature = temperature / 16
        if(temperature > 130){
            temperature = lastTemp
        }
        lastTemp = temperature
        switch (state) {
            case ValType.DS18B20_temperature_C:
                return temperature
            case ValType.DS18B20_temperature_F:
                temperature = temperature * 33.8
                return temperature
            default:
                return 0
        }

    }
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
            Reference_VOLTAGE
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
     * get dht11 temperature and humidity Value
     * @param dht11pin describe parameter here, eg: DigitalPin.P15     */
    //% advanced=true
    //% blockId="readdht11" block="value of dht11 %dht11type| at pin %dht11pin"
    export function dht11value(dht11type: DHT11Type, dht11pin: DigitalPin): number {

        //initialize
        let _temperature: number = -999.0
        let _humidity: number = -999.0
        let checksum: number = 0
        let checksumTmp: number = 0
        let dataArray: boolean[] = []
        let resultArray: number[] = []
        for (let index = 0; index < 40; index++) dataArray.push(false)
        for (let index = 0; index < 5; index++) resultArray.push(0)

        pins.setPull(dht11pin, PinPullMode.PullUp)
        pins.digitalWritePin(dht11pin, 0) //begin protocol, pull down pin
        basic.pause(18)
        pins.digitalReadPin(dht11pin) //pull up pin
        control.waitMicros(40)
        while (pins.digitalReadPin(dht11pin) == 0); //sensor response
        while (pins.digitalReadPin(dht11pin) == 1); //sensor response

        //read data (5 bytes)
        for (let index = 0; index < 40; index++) {
            while (pins.digitalReadPin(dht11pin) == 1);
            while (pins.digitalReadPin(dht11pin) == 0);
            control.waitMicros(28)
            //if sensor still pull up data pin after 28 us it means 1, otherwise 0
            if (pins.digitalReadPin(dht11pin) == 1) dataArray[index] = true
        }
        //convert byte number array to integer
        for (let index = 0; index < 5; index++)
            for (let index2 = 0; index2 < 8; index2++)
                if (dataArray[8 * index + index2]) resultArray[index] += 2 ** (7 - index2)
        //verify checksum
        checksumTmp = resultArray[0] + resultArray[1] + resultArray[2] + resultArray[3]
        checksum = resultArray[4]
        if (checksumTmp >= 512) checksumTmp -= 512
        if (checksumTmp >= 256) checksumTmp -= 256
        switch (dht11type){
            case DHT11Type.DHT11_temperature_C:
                _temperature = resultArray[2] + resultArray[3] / 100
                return _temperature
            case DHT11Type.DHT11_temperature_F:
                _temperature = resultArray[2] + resultArray[3] / 100 * 33.8
                return _temperature
            case DHT11Type.DHT11_humidity:
                _humidity = resultArray[0] + resultArray[1] / 100
                return _humidity
        }
        return 0
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
        pm25 = input.runningTime()
        while (pins.digitalReadPin(pm25pin) != 0) {
        }
        pm25 = input.runningTime() - pm25
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

    //% block="value of BME280 %state"
    export function octopus_BME280(state: BME280_state): number {
        switch (state) {
            case 0:
                get();
                return Math.round(T);
                break;
            case 1:
                get();
                return Math.round(H);
                break;
            case 2:
                get();
                return Math.round(P / 100);
                break;
            case 3:
                get();
                return Math.round(1015 - (P / 100)) * 9
                break;
            default:
                return 0
        }
        return 0;
    }
    /**
    * TODO: Detect soil moisture value(0~100%)
    * @param soilmoisturepin describe parameter here, eg: DigitalRJPin.J1
    */
    //% blockId="PIR" block="PIR sensor %pin detects motion"
    export function PIR(pin: DigitalPin): boolean {
        if (pins.digitalReadPin(pin) == 1) {
            return true
        }
        else {
            return false
        }
    }
        /**
    * get UV level value (0~15)
    * @param waterlevelpin describe parameter here, eg: AnalogRJPin.J1
    */
    //% blockId="readUVLevel" block="UV sensor %Rjpin level(0~15)"
    export function UVLevel(pin: AnalogPin): number {
        let UVlevel = pins.analogReadPin(pin);
        if (UVlevel > 625) {
            UVlevel = 625
        }
        UVlevel = pins.map(
            UVlevel,
            0,
            625,
            0,
            15
        );
        return Math.round(UVlevel)
    }
        /**
    * toggle led
    */
    //% blockId=LED block="LED %pin toggle to $ledstate || brightness %brightness \\%"
    //% brightness.min=0 brightness.max=100
    //% ledstate.shadow="toggleOnOff"
    //% expandableArgumentMode="toggle"
    export function ledBrightness(pin: AnalogPin, ledstate: boolean, brightness: number = 100): void {
        if (ledstate) {
            pins.analogSetPeriod(pin, 100)
            pins.analogWritePin(pin, Math.map(brightness, 0, 100, 0, 1023))
        }
        else {
            pins.analogWritePin(pin, 0)
            brightness = 0
        }
    }
}

