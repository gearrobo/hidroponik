#include <WiFiManager.h>
#include <WiFi.h>
#include <ArduinoOTA.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* serverUrl = "http://192.168.100.47:7001/api/data"; // ganti <IP_SERVER>
const char* relayUrl = "http://192.168.100.47:7001/api/relay/ESP32-001";

// Pin output pompa
#define RELAY1_PIN  26
#define RELAY2_PIN  27

void setup() {
  Serial.begin(115200);
  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);

  WiFiManager wm;
  wm.autoConnect("ESP32_SetupAP");
  Serial.println("WiFi Terkoneksi: " + WiFi.localIP().toString());

  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle();

  String jsonData = "";
  String api_key = "restapisoendevtesting";
  String serial_number = "ESP32-001";
  float suhuAir = random(25,35);
  float suhuUdara = random(65,90);
  float nutrisi = random(1300,1500);
  float tinggi = random(0,100);
  float pH = random(0,10);
  String uV = "cerah";
  String status = "Online";
  float latitude = -6.402905;
  double longitude = 106.778419;

  StaticJsonDocument<200> doc;
  doc["api_key"] = api_key;
  doc["serial_number"] = serial_number;
  doc["suhuAir"] = suhuAir;
  doc["suhuUdara"] = suhuUdara;
  doc["nutrisi"] = nutrisi;
  doc["tinggi"] = tinggi;
  doc["pH"] = pH;
  doc["uV"] = uV;
  doc["status"] = status;
  doc["latitude"] = latitude;
  doc["longitude"] = longitude;

  serializeJson(doc,jsonData);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(jsonData);

    if (httpResponseCode > 0) {
      Serial.println(httpResponseCode);
    } else {
      Serial.println(http.getString());
    }

    // === Ambil status relay ===
    http.begin(relayUrl);
    int code = http.GET();
    if (code == 200) {
      String response = http.getString();
      Serial.println("Relay response: " + response);
      StaticJsonDocument<128> relayDoc;
      DeserializationError err = deserializeJson(relayDoc, response);
      if (!err) {
        digitalWrite(RELAY1_PIN, relayDoc["relay1"] ? HIGH : LOW);
        digitalWrite(RELAY2_PIN, relayDoc["relay2"] ? HIGH : LOW);
      }
    }

    http.end();
  }

  delay(2000); // kirim tiap 2 detik
}

