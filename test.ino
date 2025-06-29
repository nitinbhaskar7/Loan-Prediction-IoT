#include <WiFi.h>
#include <WebServer.h>
#include <Adafruit_Fingerprint.h>
#include "SPIFFS.h"
#include <TensorFlowLite_ESP32.h>
#include "model_data_1.cc"
#include <ArduinoJson.h>
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/micro/all_ops_resolver.h"
#include "tensorflow/lite/micro/micro_error_reporter.h"
#include "tensorflow/lite/schema/schema_generated.h"

const int kTensorArenaSize = 8 * 1024;
uint8_t tensor_arena[kTensorArenaSize];

tflite::MicroInterpreter *interpreter;
TfLiteTensor *input;
TfLiteTensor *output;
tflite::ErrorReporter *error_reporter;

const char *ssid = "Redmi";
const char *password = "Welcome@123";
int enrollFingerprint(uint8_t id);
WebServer server(80);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&Serial2);
int getFingerprintIDez();
void sendStatus(String message)
{
    Serial.println(message);
}
void setup()
{
    Serial.begin(115200);
    Serial2.begin(57600); // R307 baud rate
    while (!Serial)
        ;

    static tflite::MicroErrorReporter micro_error_reporter;
    error_reporter = &micro_error_reporter;

        const tflite::Model *model = tflite::GetModel(model_data);
    if (model->version() != TFLITE_SCHEMA_VERSION)
    {
        error_reporter->Report("Model version mismatch!");
        return;
    }

    static tflite::AllOpsResolver resolver;

    static tflite::MicroInterpreter static_interpreter(
        model, resolver, tensor_arena, kTensorArenaSize, error_reporter);

    interpreter = &static_interpreter;

    if (interpreter->AllocateTensors() != kTfLiteOk)
    {
        error_reporter->Report("AllocateTensors() failed!");
        return;
    }

    input = interpreter->input(0);
    output = interpreter->output(0);

    Serial.println("Model loaded with TensorFlowLite_ESP32!");

    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected! IP: " + WiFi.localIP().toString());

    finger.begin(57600);
    // finger.emptyDatabase(); // Clear the database

    if (!SPIFFS.begin(true))
    {
        Serial.println("SPIFFS Mount Failed");
        return;
    }

    // Route for handling figerprint enrollment
    server.on("/enroll", HTTP_GET, []()
              {
    finger.getTemplateCount();

    int count = finger.templateCount;
    Serial.println(count);
    server.setContentLength(CONTENT_LENGTH_UNKNOWN);
    int ret_val = enrollFingerprint(count + 1); // Use next available ID
    sendStatus("Return : " + String(ret_val));
    if (ret_val == FINGERPRINT_OK)
    {
      server.send(200, "text/json", "{\"data\" : " + String(count + 1) + " , \"status\":\"success\"}");
    }
    else
    {
      server.send(500, "text/json", "{\"status\":\"error\"}");
    } });

    // Route for handling fingerprint verification
    server.on("/verify", HTTP_GET, []()
              {
                finger.getTemplateCount();

    int count = finger.templateCount;
    Serial.println(count);

    int id = getFingerprintIDez() ;
     server.send(200, "text/json", "{\"data\" : " + String(id) + " , \"status\":\"success\"}"); });

    // Route for running the Loan Prediction model
   server.on("/predict", HTTP_POST, []() {
  // Allocate buffer for JSON parsing
  const size_t capacity = JSON_ARRAY_SIZE(9) + 60;
  DynamicJsonDocument doc(capacity);

  // Parse incoming JSON
  if (deserializeJson(doc, server.arg("plain")) != DeserializationError::Ok) {
    server.send(400, "text/json", "{\"status\":\"error\",\"message\":\"Invalid JSON\"}");
    return;
  }

  // Get JSON array and assign to input
  JsonArray arr = doc.as<JsonArray>();
  if (arr.size() != 9) {
    server.send(400, "text/json", "{\"status\":\"error\",\"message\":\"Expected 9 values\"}");
    return;
  }
  for (int i = 0; i < 9; i++) {
    input->data.f[i] = arr[i].as<float>();
  }
    

/*
if applicant income < 10000 
OR 
loan amt < applicant income 
OR
loan amt term > 1800 
OR 
loan amt term < 30

*/


    
  // Run inference
  if (interpreter->Invoke() != kTfLiteOk) {
    Serial.println("Inference failed");
    server.send(500, "text/json", "{\"status\":\"error\",\"message\":\"Inference failed\"}");
  } else {
    float prediction = output->data.f[0];
    // if((input->data.f[6] < 10000 )|| (input->data.f[7] > input->data.f[6]) || (input->data.f[8] > 1800) || (input->data.f[8] < 30)){
    //     Serial.println(input->data.f[6]) ;
    //     Serial.println(input->data.f[7]) ;
    //     Serial.print("Predicted value: ");
    //     Serial.println(0);
    //     server.send(200, "text/json", "{\"data\": " + String("0") + ", \"status\":\"success\"}");
    // }
    // else{
        Serial.print("Predicted value: ");
        Serial.println(prediction);
        server.send(200, "text/json", "{\"data\": " + String(prediction) + ", \"status\":\"success\"}");
    // }
  }
});

    server.begin();
}

void loop()
{
    server.handleClient();
}

int getFingerprintIDez()
{
    int p = -1;
    while (p != FINGERPRINT_OK)
    {
        p = finger.getImage();
        if (p == FINGERPRINT_NOFINGER)
            continue;
        if (p != FINGERPRINT_OK)
        {
            sendStatus("Error capturing image.");
            return -1;
        }
    }

    p = finger.image2Tz(1);
    if (p != FINGERPRINT_OK)
    {
        sendStatus("Image conversion failed.");
        return -1;
    }
    p = finger.fingerFastSearch();
    if (p != FINGERPRINT_OK)
        return -1;

    // found a match!
    Serial.print("Found ID #");
    Serial.print(finger.fingerID);
    Serial.print(" with confidence of ");
    Serial.println(finger.confidence);
    return finger.fingerID;
}

int enrollFingerprint(uint8_t id)
{
    finger.getTemplateCount();
    sendStatus("Place your finger to enroll (ID #" + String(id) + ")");

    int p = -1;
    while (p != FINGERPRINT_OK)
    {
        p = finger.getImage();
        if (p == FINGERPRINT_NOFINGER)
            continue;
        if (p != FINGERPRINT_OK)
        {
            sendStatus("Error capturing image.");
            return -1;
        }
    }

    p = finger.image2Tz(1);
    if (p != FINGERPRINT_OK)
    {
        sendStatus("Image conversion failed.");
        return -1;
    }

    sendStatus("Remove finger...");
    delay(2000);
    while (finger.getImage() != FINGERPRINT_NOFINGER)
        ;

    sendStatus("Place the same finger again...");
    p = -1;
    while (p != FINGERPRINT_OK)
    {
        p = finger.getImage();
        if (p == FINGERPRINT_NOFINGER)
            continue;
        if (p != FINGERPRINT_OK)
        {
            sendStatus("Error capturing 2nd image.");
            return -1;
        }
    }

    p = finger.image2Tz(2);
    if (p != FINGERPRINT_OK)
    {
        sendStatus("Second image conversion failed.");
        return -1;
    }

    p = finger.createModel();
    if (p == FINGERPRINT_OK)
    {
        sendStatus("Fingerprint matched successfully.");
    }
    else
    {
        sendStatus("Fingerprint mismatch.");
        return -1;
    }

    p = finger.storeModel(id);
    if (p == FINGERPRINT_OK)
    {
        return p;
    }
    else
    {
        return -1;
    }
}