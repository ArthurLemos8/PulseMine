#include <Wire.h>
#include <math.h>

#define ADXL345 0x53

float x, y, z;

void setup() {

  Serial.begin(9600);
  Wire.begin();

  // Coloca o ADXL345 em modo de medição
  Wire.beginTransmission(ADXL345);
  Wire.write(0x2D);
  Wire.write(0x08);
  Wire.endTransmission();
}

void loop() {

  // Inicia leitura dos registradores de dados
  Wire.beginTransmission(ADXL345);
  Wire.write(0x32);
  Wire.endTransmission(false);

  // Solicita 6 bytes (X, Y e Z)
  Wire.requestFrom(ADXL345, 6);

  if (Wire.available() == 6) {

    int16_t rawX = Wire.read() | (Wire.read() << 8);
    int16_t rawY = Wire.read() | (Wire.read() << 8);
    int16_t rawZ = Wire.read() | (Wire.read() << 8);

    // Conversão para g
    x = rawX * 0.004;
    y = rawY * 0.004;
    z = rawZ * 0.004;

    // Aceleração total
    float aceleracaoTotal =
      sqrt(x * x + y * y + z * z);

    // Intervalo entre leituras (300 ms)
    float dt = 0.1;

    // Vibração estimada em mm/s
    float vibracaoMmS =
      abs(aceleracaoTotal - 1.0) * 9810.0 * dt;

    // Envia JSON
    Serial.print("{");

    Serial.print("\"dispositivo\":\"ADXL345\",");

    Serial.print("\"vibracaoMmS\":");
    Serial.print(vibracaoMmS, 2);
    Serial.print(",");

    Serial.print("\"tempoMillis\":");
    Serial.print(millis());

    Serial.println("}");

  } else {

    Serial.println("{\"erro\":\"falha_leitura\"}");

  }

  delay(100);
}