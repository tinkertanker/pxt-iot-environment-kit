/**
 * Custom blocks
 */
//% color=#ff7a4b icon="\uf2db" block="Octopus"
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
    let PHvalue: number[] = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    let PHcnt = 0

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

    export enum INA219_state {
        //% block="voltage(MV)" enumval=0
        INA219_voltagemv,

        //% block="voltage(V)" enumval=1
        INA219_voltage,

        //% block="current(MA)" enumval=2
        INA219_currentma,

        //% block="current(A)" enumval=3
        INA219_current,

        //% block="power(W)" enumval=4
        INA219_power,
    }

    export enum TrackingStateType {
        //% block="● ●" enumval=0
        Tracking_State_0,

        //% block="● ◌" enumval=1
        Tracking_State_1,

        //% block="◌ ●" enumval=2
        Tracking_State_2,

        //% block="◌ ◌" enumval=3
        Tracking_State_3
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

    ////////////////////////////////////////////////////////NFC////////////////////////////////////////////
    let NFC_I2C_ADDR = (0x48 >> 1);
    let recvBuf = pins.createBuffer(32);
    let recvAck = pins.createBuffer(8);
    let ackBuf = pins.createBuffer(6);
    let uId = pins.createBuffer(4);
    let passwdBuf = pins.createBuffer(6);
    let blockData = pins.createBuffer(16);
    let NFC_ENABLE = 0;
    const block_def = 1;
    ackBuf[0] = 0x00;
    ackBuf[1] = 0x00;
    ackBuf[2] = 0xFF;
    ackBuf[3] = 0x00;
    ackBuf[4] = 0xFF;
    ackBuf[5] = 0x00;
    passwdBuf[0] = 0xFF;
    passwdBuf[1] = 0xFF;
    passwdBuf[2] = 0xFF;
    passwdBuf[3] = 0xFF;
    passwdBuf[4] = 0xFF;
    passwdBuf[5] = 0xFF;
    function writeAndReadBuf(buf: Buffer, len: number) {
        pins.i2cWriteBuffer(NFC_I2C_ADDR, buf);
        basic.pause(100);
        recvAck = pins.i2cReadBuffer(NFC_I2C_ADDR, 8);
        basic.pause(100);
        recvBuf = pins.i2cReadBuffer(NFC_I2C_ADDR, len - 4);
    }
    function checkDcs(len: number): boolean {
        let sum = 0, dcs = 0;
        for (let i = 1; i < len - 2; i++) {
            if ((i === 4) || (i === 5)) {
                continue;
            }
            sum += recvBuf[i];
        }
        dcs = 0xFF - (sum & 0xFF);
        if (dcs != recvBuf[len - 2]) {
            return false;
        }
        return true;
    }
    function passwdCheck(id: Buffer, st: Buffer): boolean {
        let buf: number[] = [];
        buf = [0x00, 0x00, 0xFF, 0x0F, 0xF1, 0xD4, 0x40, 0x01, 0x60, 0x07, 0xFF,
            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xD1, 0xAA, 0x40, 0xEA, 0xC2, 0x00];
        let cmdPassWord = pins.createBufferFromArray(buf);
        let sum = 0, count = 0;
        cmdPassWord[9] = block_def;
        for (let i = 10; i < 16; i++)
            cmdPassWord[i] = st[i - 10];
        for (let i = 16; i < 20; i++)
            cmdPassWord[i] = id[i - 16];
        for (let i = 0; i < 20; i++) {
            if (i === 3 || i === 4) {
                continue;
            }
            sum += cmdPassWord[i];
        }
        cmdPassWord[20] = 0xff - (sum & 0xff)
        writeAndReadBuf(cmdPassWord, 15);
        for (let i = 0; i < 4; i++) {
            if (recvAck[1 + i] != ackBuf[i]) {
                serial.writeLine("psd ack ERROR!");
                return false;
            }
        }
        if ((recvBuf[6] === 0xD5) && (recvBuf[7] === 0x41) && (recvBuf[8] === 0x00) && (checkDcs(15 - 4))) {
            return true;
        }
        return false;
    }
    function wakeup() {
        basic.pause(100);
        let i = 0;
        let buf: number[] = [];
        buf = [0x00, 0x00, 0xFF, 0x05, 0xFB, 0xD4, 0x14, 0x01, 0x14, 0x01, 0x02, 0x00];
        let cmdWake = pins.createBufferFromArray(buf);
        writeAndReadBuf(cmdWake, 14);
        for (i = 0; i < ackBuf.length; i++) {
            if (recvAck[1 + i] != ackBuf[i]) {
                break;
            }
        }
        if ((i != ackBuf.length) || (recvBuf[6] != 0xD5) || (recvBuf[7] != 0x15) || (!checkDcs(14 - 4))) {
            NFC_ENABLE = 0;
        } else {
            NFC_ENABLE = 1;
        }
        basic.pause(100);
    }
    function writeblock(data: Buffer): void {
        if (!passwdCheck(uId, passwdBuf))
            return;
        let cmdWrite: number[] = [0x00, 0x00, 0xff, 0x15, 0xEB, 0xD4, 0x40, 0x01, 0xA0,
            0x06, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0xCD,
            0x00];
        let sum = 0, count = 0;
        cmdWrite[9] = block_def;
        for (let i = 10; i < 26; i++)
            cmdWrite[i] = data[i - 10];
        for (let i = 0; i < 26; i++) {
            if ((i === 3) || (i === 4)) {
                continue;
            }
            sum += cmdWrite[i];
        }
        cmdWrite[26] = 0xff - (sum & 0xff);
        let tempbuf = pins.createBufferFromArray(cmdWrite)
        writeAndReadBuf(tempbuf, 16);
    }
    ///////////////////////////////////////////////////////////////////////////////////////////

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
    function init_18b20(mpin: DigitalPin) {
        pins.digitalWritePin(mpin, 0)
        control.waitMicros(600)
        pins.digitalWritePin(mpin, 1)
        control.waitMicros(30)
        ack = pins.digitalReadPin(mpin)
        control.waitMicros(600)
        return ack
    }
    function write_18b20(mpin: DigitalPin, data: number) {
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
    function read_18b20(mpin: DigitalPin) {
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
    export function Ds18b20Temp(pin: DigitalPin, state: ValType): number {
        init_18b20(pin)
        write_18b20(pin, 0xCC)
        write_18b20(pin, 0x44)
        basic.pause(10)
        init_18b20(pin)
        write_18b20(pin, 0xCC)
        write_18b20(pin, 0xBE)
        low = read_18b20(pin)
        high = read_18b20(pin)
        temperature = high << 8 | low
        temperature = temperature / 16
        if (temperature > 130) {
            temperature = lastTemp
        }
        lastTemp = temperature
        switch (state) {
            case ValType.DS18B20_temperature_C:
                return temperature
            case ValType.DS18B20_temperature_F:
                temperature = (temperature * 1.8) + 32
                return temperature
            default:
                return 0
        }

    }
    /**
     * get dust value (μg/m³) 
     * @param vLED describe parameter here
     * @param vo describe parameter here
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
     * @param distance_unit describe parameter here
     * @param pin describe parameter here
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
        // let distance = d * 10 * 5 / 3 / 58
        let distance = d * 10 / 58

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



    function delay_us(us: number) {
        // control.waitMicros(us)
        let time = input.runningTimeMicros() + us;
        while (input.runningTimeMicros() < time);
    }
    function waitDigitalReadPin(state: number, timeout: number, pin: DigitalPin) {
        while (pins.digitalReadPin(pin) != state) {
            if (!(--timeout)) {
                return 0
            }
        };
        return 1
    }

    let __dht11_last_read_time = 0;
    let __temperature: number = 0
    let __humidity: number = 0

    /**
     * get dht11 temperature and humidity Value
     * @param dht11pin describe parameter here
     */
    //% advanced=true
    //% blockId="readdht11" block="value of dht11 %dht11type| at pin %dht11pin"
    export function dht11value(dht11type: DHT11Type, dht11pin: DigitalPin): number {
        //initialize
        if (__dht11_last_read_time != 0 && __dht11_last_read_time + 1000 > input.runningTime()) {
            switch (dht11type) {
                case DHT11Type.DHT11_temperature_C:
                    return __temperature
                case DHT11Type.DHT11_temperature_F:
                    return (__temperature * 1.8) + 32
                case DHT11Type.DHT11_humidity:
                    return __humidity
                default:
                    return 0
            }
        }
        let fail_flag: number = 0
        let pin = dht11pin
        pins.setPull(pin, PinPullMode.PullUp)
        for (let count = 0; count < (__dht11_last_read_time == 0 ? 20 : 10); count++) {
            if (count != 0) {
                basic.pause(5);
            }
            fail_flag = 0;
            // 拉高1us后拉低代表重置
            pins.digitalWritePin(pin, 1)
            delay_us(1)
            pins.digitalWritePin(pin, 0)
            basic.pause(18)
            // 等待18ms后拉高代表开始
            pins.digitalWritePin(pin, 1) //pull up pin for 18us
            delay_us(30)
            pins.digitalReadPin(pin);
            if (!(waitDigitalReadPin(1, 9999, pin))) continue;
            if (!(waitDigitalReadPin(0, 9999, pin))) continue;
            //read data (5 bytes)
            let data_arr = [0, 0, 0, 0, 0];
            let i, j;
            for (i = 0; i < 5; i++) {
                for (j = 0; j < 8; j++) {
                    if (!(waitDigitalReadPin(0, 9999, pin))) {
                        fail_flag = 1
                        break;
                    }
                    if (!(waitDigitalReadPin(1, 9999, pin))) {
                        fail_flag = 1
                        break;
                    }
                    delay_us(40)
                    //if sensor still pull up data pin after 28 us it means 1, otherwise 0
                    if (pins.digitalReadPin(pin) == 1) {
                        data_arr[i] |= 1 << (7 - j)
                    }
                }
                if (fail_flag) break;
            }
            if (fail_flag) {
                continue;
            };

            if (data_arr[4] == ((data_arr[0] + data_arr[1] + data_arr[2] + data_arr[3]) & 0xFF)) {
                __temperature = data_arr[2] + data_arr[3] / 100
                __humidity = data_arr[0] + data_arr[1] / 100
                __dht11_last_read_time = input.runningTime();
                break;
            }
            fail_flag = 1;
        }
        switch (dht11type) {
            case DHT11Type.DHT11_temperature_C:
                return __temperature
            case DHT11Type.DHT11_temperature_F:
                return (__temperature * 1.8) + 32
            case DHT11Type.DHT11_humidity:
                return __humidity
            default:
                return 0
        }
    }

    /**
     * get pm2.5 value (μg/m³) 
     * @param pm25pin describe parameter here
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
     * @param pm10pin describe parameter here    
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
     * @param soilmoisturepin describe parameter here
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
     * @param lightintensitypin describe parameter here
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
     * @param waterlevelpin describe parameter here
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
     * @param windspeedpin describe parameter here
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
     * @param noisepin describe parameter here
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
    * @param soilmoisturepin describe parameter here
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
    * Return to the collision sensor status, on or off
    * @param Rjpin describe parameter here
    */
    //% blockId=Crash block="Crash Sensor %Rjpin is pressed"
    export function Crash(pin: DigitalPin): boolean {
        pins.setPull(pin, PinPullMode.PullUp)
        if (pins.digitalReadPin(pin) == 0) {
            return true
        }
        else {
            return false
        }
    }

    /**
* get UV level value (0~15)
* @param waterlevelpin describe parameter here
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
    let compensation_factor = 1.0

    /**
    * get PH level value (0~14)
    * @param pin describe parameter here
    */
    //% blockId="readPHLevel" block="PH sensor %Rjpin level(0~14)"
    export function readPHLevel(pin: AnalogPin): number {
        let PHlevel = 0.0;
        PHvalue[PHcnt++] = pins.analogReadPin(pin);
        if (PHcnt >= 20)
            PHcnt = 0;
        for (let i = 0; i < 20; i++) {
            PHlevel += PHvalue[i]
        }
        PHlevel = PHlevel / 20.0
        PHlevel = 3.3 * (PHlevel / 1023.0)
        PHlevel = (PHlevel * (-5.7541) + 16.654) * 0.997 * compensation_factor
        //直线斜率优化
        PHlevel = PHlevel - ((6.86 - PHlevel) * (1 / 39.9))
        if (PHlevel > 14) {
            PHlevel = 14.00
        }
        else if (PHlevel < 0) {
            PHlevel = 0.00
        }
        // serial.writeNumber(PHlevel)
        return Math.round(PHlevel * 10) / 10.0;
    }

    /**
    * alibration PH level value (0.0~10.00)
    * @param pin describe parameter here
    */
    //% blockId="calibrationPHLevel" block="PH sensor %Rjpin %alibration_value alibration value"
    export function calibrationPHLevel(pin: AnalogPin, alibration_value: number): void {
        let PHlevel = 0;
        for (let i = 0; i < 20; i++) {
            PHlevel += PHvalue[i]
        }
        PHlevel = PHlevel / 20.0
        PHlevel = 3.3 * (PHlevel / 1024.0)
        PHlevel = (PHlevel * (-5.7541) + 16.654) * 0.997
        compensation_factor = alibration_value / PHlevel
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

    //% block="RFID sensor IIC port read data from card"
    export function readDataBlock(): string {
        if (NFC_ENABLE === 0) {
            wakeup();
        }
        if (checkCard() === false) {
            serial.writeLine("No NFC Card!")
            return ""
        }
        if (!passwdCheck(uId, passwdBuf)) {
            serial.writeLine("passwd error!")
            return "";
        }
        let cmdRead: number[] = []
        cmdRead = [0x00, 0x00, 0xff, 0x05, 0xfb, 0xD4, 0x40, 0x01, 0x30, 0x07, 0xB4, 0x00];
        let sum = 0, count = 0;
        cmdRead[9] = block_def;
        for (let i = 0; i < cmdRead.length - 2; i++) {
            if ((i === 3) || (i === 4)) {
                continue;
            }
            sum += cmdRead[i];
        }
        cmdRead[cmdRead.length - 2] = 0xff - sum & 0xff;
        let buf = pins.createBufferFromArray(cmdRead)
        writeAndReadBuf(buf, 31);
        let ret = "";
        if ((recvBuf[6] === 0xD5) && (recvBuf[7] === 0x41) && (recvBuf[8] === 0x00) && (checkDcs(31 - 4))) {
            for (let i = 0; i < 16; i++) {
                if (recvBuf[i + 9] >= 0x20 && recvBuf[i + 9] < 0x7f) {
                    ret += String.fromCharCode(recvBuf[i + 9]) // valid ascii
                }
            }
            return ret;
        }
        return ""
    }
    //% block="RFID sensor IIC port write %data to card"
    export function writeData(data: string): void {
        let len = data.length
        if (len > 16) {
            len = 16
        }
        for (let i = 0; i < len; i++) {
            blockData[i] = data.charCodeAt(i)
        }
        writeblock(blockData);
    }
    //% block="RFID sensor IIC port Detect Card"
    export function checkCard(): boolean {
        if (NFC_ENABLE === 0) {
            wakeup();
        }
        let buf: number[] = [];
        buf = [0x00, 0x00, 0xFF, 0x04, 0xFC, 0xD4, 0x4A, 0x01, 0x00, 0xE1, 0x00];
        let cmdUid = pins.createBufferFromArray(buf);
        writeAndReadBuf(cmdUid, 24);
        for (let i = 0; i < 4; i++) {
            if (recvAck[1 + i] != ackBuf[i]) {
                return false;
            }
        }
        if ((recvBuf[6] != 0xD5) || (!checkDcs(24 - 4))) {
            return false;
        }
        for (let i = 0; i < uId.length; i++) {
            uId[i] = recvBuf[14 + i];
        }
        if (uId[0] === uId[1] && uId[1] === uId[2] && uId[2] === uId[3] && uId[3] === 0xFF) {
            return false;
        }
        return true;
    }

    let ina219_voltage = 0.0;
    let ina219_current = 0.0;

    function ina219_send_start_signal_and_wait_response(pin: DigitalPin): number {
        let overtimr = 0;

        pins.setPull(pin, PinPullMode.PullNone);
        pins.digitalWritePin(pin, 1);

        pins.digitalWritePin(pin, 0);
        basic.pause(10);
        pins.digitalWritePin(pin, 1);
        basic.pause(10);

        pins.setPull(pin, PinPullMode.PullUp);
        while (pins.digitalReadPin(pin) === 1 && overtimr++ < 20000) {
        }
        if (pins.digitalReadPin(pin) === 0) {
            basic.pause(5);
            if (pins.digitalReadPin(pin) === 0) {
                while (pins.digitalReadPin(pin) === 0 && overtimr++ < 20000) {
                }
                return 0;
            }
            else {
                return 2;
            }
        }
        return 1;
    }

    function ina219_read_byte(pin: DigitalPin): number {
        let byte = 0;

        for (let i = 1; i <= 8; i++) {
            byte |= ina219_read_bit(pin) << 8 - i;
        }
        return byte;
    }

    function ina219_read_bit(pin: DigitalPin): number {
        let bit = 0;

        pins.setPull(pin, PinPullMode.PullUp);

        let overtimr = 0;
        while (pins.digitalReadPin(pin) === 1 && overtimr++ < 10000) {
        }
        overtimr = 0;
        while (pins.digitalReadPin(pin) === 0 && overtimr++ < 10000) {
        }

        control.waitMicros(150);

        bit = pins.digitalReadPin(pin);

        return bit;
    }

    //% block="INA219 sensor on %ina219pin read %value"
    //% value.defl(INA219_state.INA219_currentma)
    export function INA219_read_value(ina219pin: DigitalPin, value: INA219_state): number {
        basic.pause(50);
        let data = [0, 0, 0, 0, 0];
        let readcnt = 10;
        while (readcnt--) {
            let result = ina219_send_start_signal_and_wait_response(ina219pin);
            if (result !== 0) {
                basic.pause(20);
                continue;
            }

            for (let i = 0; i < 5; i++) {
                data[i] = ina219_read_byte(ina219pin);
            }

            if (data[4] == ((data[0] + data[1] + data[2] + data[3]) & 0xff)) {
                break;
            }
            if (readcnt <= 0) {
                return 0;
            }
        }

        ina219_voltage = data[0] << 8 | data[1];
        ina219_current = data[2] << 8 | data[3];

        switch (value) {
            case INA219_state.INA219_voltagemv:
                return ina219_voltage;
            case INA219_state.INA219_voltage:
                return ina219_voltage /= 1000.0;
            case INA219_state.INA219_currentma:
                return ina219_current;
            case INA219_state.INA219_current:
                return ina219_current /= 1000.0;
            case INA219_state.INA219_power:
                return ina219_voltage / 1000.0 * ina219_current / 1000.0;
        }
    }

    //% block="Line-tracking senor on S1 %pin1 and S2 %pin2 to identifying %state"
    export function doubleTrackingValue(pin1: DigitalPin, pin2: DigitalPin,state:TrackingStateType): Boolean {
        let lpin = pin1;
        let rpin = pin2;
        pins.setPull(lpin, PinPullMode.PullUp)
        pins.setPull(rpin, PinPullMode.PullUp)
        let lsensor = pins.digitalReadPin(lpin)
        let rsensor = pins.digitalReadPin(rpin)
        if (lsensor == 0 && rsensor == 0 && state == TrackingStateType.Tracking_State_0) {
            return true;
        } else if (lsensor == 0 && rsensor == 1 && state == TrackingStateType.Tracking_State_1) {
            return true;
        } else if (lsensor == 1 && rsensor == 0 && state == TrackingStateType.Tracking_State_2) {
            return true;
        } else if (lsensor == 1 && rsensor == 1 && state == TrackingStateType.Tracking_State_3) {
            return true;
        } else return false;
    }
}

