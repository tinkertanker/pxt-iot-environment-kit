OLED.init(64, 128)
ESP8266_IoT.initwifi(SerialPin.P2, SerialPin.P8)
basic.forever(() => {
    ESP8266_IoT.tosendtext(
    "your write api key",
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
    )
})
