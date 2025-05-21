#include <WiFiManager.h>
#include <WiFi.h>
#include <ArduinoOTA.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* serverUrl = "http://192.168.100.47:7001/api/data"; // ganti <IP_SERVER>

void setup() {
  Serial.begin(115200);
  WiFiManager wm;
  wm.autoConnect("ESP32_SetupAP");
  Serial.println("WiFi Terkoneksi: " + WiFi.localIP().toString());

  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle();

  String jsonData = "";
  String api_key = "restapisoendevtesting";
  String serial_number = "soendevmonsisversi1.0xx01depok";
  float suhu = random(25,35);
  float kelembaban = random(65,90);
  float nutrisi = random(1300,1500);
  float tinggi = random(0,100);
  float pH = random(0,10);
  String uV = "cerah";
  String status = "Online";
  float latitude = -6.402905;
  float longtitude = 106.778419;

  StaticJsonDocument<200> doc;
  doc["api_key"] = api_key;
  doc["serial_number"] = serial_number;
  doc["suhu"] = suhu;
  doc["kelembaban"] = kelembaban;
  doc["nutrisi"] = nutrisi;
  doc["tinggi"] = tinggi;
  doc["pH"] = pH;
  doc["uV"] = uV;
  doc["status"] = status;
  doc["latitude"] = latitude;
  doc["longtitude"] = longtitude;

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

    http.end();
  }

  delay(10000); // kirim tiap 2 detik
}

