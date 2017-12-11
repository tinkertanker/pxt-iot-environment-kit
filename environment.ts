
/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */


/**
 * Custom blocks
 */
//% weight=90 color=#0fbc11 icon="\uf0ee"
namespace Environment_IoT {
    let dustvled = DigitalPin.P10
    let dustvo = AnalogPin.P1

    let wifiTX = SerialPin.P8
    let wifiRX = SerialPin.P2

    let dht11buf: number[] = []

    /**
     * TODO: describe your function here
     * @param vLED describe parameter here, eg: DigitalPin.P10
     * @param vo describe parameter here, eg: AnalogPin.P1
     */
    //% blockId="dust_init" block="dust sensor init at vLED %vLED| vo %vo"
    //export function initiotkit(n: number, s: string, e: MyEnum): void {
    export function initdust(vLED: DigitalPin, vo: AnalogPin): void {
        dustvled = vLED
        dustvo = vo
        // Add code here
    }


    /**
     * TODO: describe your function here
     * @param value describe value here, eg: 5
     */
    //% block  
    export function ReadDust(): number {
        let voltage = 0;
        let dust = 0;
        pins.digitalWritePin(dustvled, 0);
        control.waitMicros(280);
        voltage = pins.analogReadPin(dustvo);
        control.waitMicros(40);
        pins.digitalWritePin(dustvled, 1);
        voltage = pins.map(
            voltage,
            0,
            1023,
            0,
            4650
        );
        dust = (voltage - 580) * 5 / 29;
        return dust;
    }

    /**
     * TODO: describe your function here
     * @param temppin describe parameter here, eg: AnalogPin.P0
     */
    //% blockId="readtemp" block="read temperature at pin %temp"
    export function ReadTemperature(temppin: AnalogPin): number {
        let voltage = 0;
        let Temperature = 0;


        
        voltage = pins.map(
            pins.analogReadPin(temppin),
            0,
            1023,
            0,
            3100
        );

        Temperature = (voltage - 500) / 10;
        return Temperature;
    }

    /**
     * TODO: describe your function here
     * @param pm25pin describe parameter here, eg: DigitalPin.P11
     */
    //% blockId="readpm25" block="read pm2.5 at pin %temp"
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
     * TODO: describe your function here
     * @param pm10pin describe parameter here, eg: DigitalPin.P12
     */
    //% blockId="readpm10" block="read pm10 at pin %temp"
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
    * Read DHT11 Humidity
    */
    //% blockId="readHumidity" block="Read DHT11 Humidity at P0"
    //% weight=5
    export function ReadHumidity(): number {
        let humidity=0
        humidity = minode.DHTGetHumidity(0)
        return humidity;
    }
    
    
    /**
    * Read DHT11 Temperature
    */
    //% blockId="readTemperature" block="Read DHT11 Temperature at P0"
    //% weight=5
    export function ReadTemperature(): number {
        let temp = 0
        temp = minode.DHTGetTemperature(ConnName.A0, DHTTemStyle.MINODE_DHT_CELSIUS)
        return temp;
    }
    
   
    



}
