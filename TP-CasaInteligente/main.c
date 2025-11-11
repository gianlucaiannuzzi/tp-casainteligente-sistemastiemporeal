/*
 * FreeRTOS V202212.00
 * Copyright (C) 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * https://www.FreeRTOS.org
 * https://github.com/FreeRTOS
 *
 */

#include <stdio.h>
#include <conio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <time.h>
#include <stdarg.h>

#include "FreeRTOS.h"
#include "task.h"
#include "timers.h"
#include "semphr.h"
#include <stdint.h>
#include <windows.h>
#include "trcRecorder.h"

#define NUM_ROOMS 3
#define TEMP_MIN 20
#define TEMP_MAX 24
#define LUX_THRESHOLD 100

int g_temperatures[NUM_ROOMS];
int g_luxLevels[NUM_ROOMS];
bool g_motionDetected[NUM_ROOMS];

bool g_thermostatOn = false;
bool g_lightsState[NUM_ROOMS] = { false, false, false };
bool g_alarmOn = false;
bool g_alarmArmed = true;

SemaphoreHandle_t xSystemStateMutex;
SemaphoreHandle_t xPrintMutex;

void safe_printf(const char* format, ...) {
	va_list args;
	if (xSemaphoreTake(xPrintMutex, portMAX_DELAY) == pdTRUE) {
		va_start(args, format);
		vprintf(format, args);
		va_end(args);
		xSemaphoreGive(xPrintMutex);
	}
}

// --- Tareas de Control (Consumidores) ---
// Leen el estado global y actuan.

void vTaskClimatization(void* pvParameters) {
	const TickType_t xFrequency = pdMS_TO_TICKS(7000 + 200); // lee después del sensor para activarla de inmediato
	TickType_t xLastWakeTime = xTaskGetTickCount();
	bool shouldBeOn = false;

	for (;;) {
		vTaskDelayUntil(&xLastWakeTime, xFrequency);
		shouldBeOn = false;

		if (xSemaphoreTake(xSystemStateMutex, portMAX_DELAY) == pdTRUE) {
			for (int i = 0; i < NUM_ROOMS; i++) {
				if (g_temperatures[i] < TEMP_MIN || g_temperatures[i] > TEMP_MAX) {
					shouldBeOn = true;
					break;
				}
			}

			if (g_thermostatOn != shouldBeOn) {
				g_thermostatOn = shouldBeOn;
				safe_printf("[CLIMATIZACION] Termostato %s\n",
					g_thermostatOn ? "ENCENDIDO" : "APAGADO");
			}

			xSemaphoreGive(xSystemStateMutex);
		}
	}
}

void vTaskLighting(void* pvParameters) {
	const TickType_t xFrequency = pdMS_TO_TICKS(2000);
	TickType_t xLastWakeTime = xTaskGetTickCount();

	for (;;) {
		vTaskDelayUntil(&xLastWakeTime, xFrequency);

		if (xSemaphoreTake(xSystemStateMutex, portMAX_DELAY) == pdTRUE) {
			for (int i = 0; i < NUM_ROOMS; i++) {
				bool newState = (g_luxLevels[i] < LUX_THRESHOLD);
				if (g_lightsState[i] != newState) {
					g_lightsState[i] = newState;
					safe_printf("[LUCES] Habitacion %d ---> %s\n", i, g_lightsState[i] ? "ON" : "OFF");
				}
			}
			xSemaphoreGive(xSystemStateMutex);
		}
	}
}

void vTaskSecurity(void* pvParameters) {
	const TickType_t xFrequency = pdMS_TO_TICKS(500);
	TickType_t xLastWakeTime = xTaskGetTickCount();

	for (;;) {
		vTaskDelayUntil(&xLastWakeTime, xFrequency);

		if (xSemaphoreTake(xSystemStateMutex, portMAX_DELAY) == pdTRUE) {

			// Si la alarma está armada y no está sonando
			if (g_alarmArmed && !g_alarmOn) {
				for (int i = 0; i < NUM_ROOMS; i++) {
					if (g_motionDetected[i]) {
						g_alarmOn = true;
						safe_printf("[ALARMA] MOVIMIENTO DETECTADO! Alarma SONANDO!\n");
						xSemaphoreGive(xSystemStateMutex);

						//Suena durante 15 segundos
						vTaskDelay(pdMS_TO_TICKS(15000));

						// Apagar alarma
						if (xSemaphoreTake(xSystemStateMutex, portMAX_DELAY) == pdTRUE) {
							g_alarmOn = false;
							g_alarmArmed = false;
							safe_printf("[ALARMA] Alarma APAGADA tras 15 segundos.\n");
							xSemaphoreGive(xSystemStateMutex);
						}

						// Esperar 5 segundos y volver a activar el sistema
						vTaskDelay(pdMS_TO_TICKS(5000));
						if (xSemaphoreTake(xSystemStateMutex, portMAX_DELAY) == pdTRUE) {
							g_alarmArmed = true;
							safe_printf("[CONTROL] Sistema de alarma REACTIVADO.\n");
							xSemaphoreGive(xSystemStateMutex);
						}

						break;
					}
				}
			}
			xSemaphoreGive(xSystemStateMutex);
		}
	}
}

void vTaskSystemMonitor(void* pvParameters) {
	const TickType_t xFrequency = pdMS_TO_TICKS(30000); // cada 30 segundos
	TickType_t xLastWakeTime = xTaskGetTickCount();

	for (;;) {
		vTaskDelayUntil(&xLastWakeTime, xFrequency);

		if (xSemaphoreTake(xSystemStateMutex, portMAX_DELAY) == pdTRUE) {
			safe_printf("\n================ ESTADO DEL SISTEMA ================\n");

			// Estado de alarma
			safe_printf("[CONTROL] Alarma: %s | Sonando: %s\n",
				g_alarmArmed ? "ACTIVADA" : "APAGADA",
				g_alarmOn ? "SI" : "NO");

			// Estado del termostato
			safe_printf("[TERMOSTATO] Estado: %s\n",
				g_thermostatOn ? "ENCENDIDO" : "APAGADO");

			// Estado de habitaciones
			for (int i = 0; i < NUM_ROOMS; i++) {
				safe_printf("[HABITACION %d] Temp: %d Grados Celcius | Lux: %d | Luz: %s | Movimiento: %s\n",
					i,
					g_temperatures[i],
					g_luxLevels[i],
					g_lightsState[i] ? "ON" : "OFF",
					g_motionDetected[i] ? "Sí" : "No");
			}

			safe_printf("===================================================\n\n");
			xSemaphoreGive(xSystemStateMutex);
		}
	}
}

// --- Tareas de Simulación de Sensores (Productores) ---
// Cada habitación tiene una simulación independiente y con fluctuaciones suaves.

void vTaskSimTemperature(void* pvParameters) {
	int room_index = *((int*)pvParameters);
	const TickType_t xFrequency = pdMS_TO_TICKS(7000);
	TickType_t xLastWakeTime = xTaskGetTickCount();

	// Semilla única para cada tarea (evita valores idénticos)
	srand(time(NULL) + room_index * 1234);

	int temp = 20 + (rand() % 5);  // valor inicial entre 20 y 24

	for (;;) {
		vTaskDelayUntil(&xLastWakeTime, xFrequency);

		// Pequeña variación: -1, 0 o +1 grados
		int delta = (rand() % 3) - 1;
		temp += delta;

		// Limitar entre 16 y 28
		if (temp < 16) temp = 16;
		if (temp > 28) temp = 28;

		if (xSemaphoreTake(xSystemStateMutex, portMAX_DELAY) == pdTRUE) {
			g_temperatures[room_index] = temp;
			xSemaphoreGive(xSystemStateMutex);
		}

		safe_printf("[SIM-TEMP-%d] Nueva temperatura: %d Grados Celcius\n", room_index, temp);
	}
}

void vTaskSimLight(void* pvParameters) {
	int room_index = *((int*)pvParameters);
	const TickType_t xFrequency = pdMS_TO_TICKS(5000);
	TickType_t xLastWakeTime = xTaskGetTickCount();

	srand(time(NULL) + room_index * 4321);

	int lux = 50 + (rand() % 151);  // valor inicial entre 50 y 200

	for (;;) {
		vTaskDelayUntil(&xLastWakeTime, xFrequency);

		// Variación suave: +/- 30 lux
		int delta = (rand() % 61) - 30;
		lux += delta;

		// Limitar entre 50 y 200
		if (lux < 50) lux = 50;
		if (lux > 200) lux = 200;

		if (xSemaphoreTake(xSystemStateMutex, portMAX_DELAY) == pdTRUE) {
			g_luxLevels[room_index] = lux;
			xSemaphoreGive(xSystemStateMutex);
		}

		safe_printf("[SIM-LUZ-%d] Nivel de luz: %d lux\n", room_index, lux);
	}
}

void vTaskSimMotion(void* pvParameters) {
	int room_index = *((int*)pvParameters);
	const TickType_t xFrequency = pdMS_TO_TICKS(3000);
	TickType_t xLastWakeTime = xTaskGetTickCount();

	srand(time(NULL) + room_index * 9876);

	for (;;) {
		vTaskDelayUntil(&xLastWakeTime, xFrequency);

		// Probabilidad de movimiento del 2%
		int prob = 2;
		bool new_motion = ((rand() % 100) < prob);

		if (xSemaphoreTake(xSystemStateMutex, portMAX_DELAY) == pdTRUE) {
			g_motionDetected[room_index] = new_motion;
			xSemaphoreGive(xSystemStateMutex);
		}

		if (new_motion)
			safe_printf("[SIM-MOV-%d] Movimiento detectado\n", room_index);
		else
			safe_printf("[SIM-MOV-%d] Sin movimiento\n", room_index);
	}
}

// Tarea para generar un archivo JSON con el estado del sistema. Se usa para el frontend.
void vTaskJSON(void* pvParameters) {
	while (1) {
		FILE* f = fopen("estado.json", "w");
		if (f) {
			fprintf(f,
				"{\n"
				"  \"alarma\": %s,\n"
				"  \"sonando\": %s,\n"
				"  \"termostato\": %s,\n"
				"  \"habitaciones\": [\n"
				"    { \"nombre\": \"Cocina\", \"temperatura\": %d, \"lux\": %d, \"luz\": %s, \"movimiento\": %s },\n"
				"    { \"nombre\": \"Living\", \"temperatura\": %d, \"lux\": %d, \"luz\": %s, \"movimiento\": %s },\n"
				"    { \"nombre\": \"Dormitorio\", \"temperatura\": %d, \"lux\": %d, \"luz\": %s, \"movimiento\": %s }\n"
				"  ]\n"
				"}\n",
				g_alarmArmed ? "true" : "false",
				g_alarmOn ? "true" : "false",
				g_thermostatOn ? "true" : "false",
				g_temperatures[0], g_luxLevels[0], g_lightsState[0] ? "true" : "false", g_motionDetected[0] ? "true" : "false", // Cocina (temperatura, lux, luz, movimiento)
				g_temperatures[1], g_luxLevels[1], g_lightsState[1] ? "true" : "false", g_motionDetected[1] ? "true" : "false", // Living (temperatura, lux, luz, movimiento)
				g_temperatures[2], g_luxLevels[2], g_lightsState[2] ? "true" : "false", g_motionDetected[2] ? "true" : "false"  // Dormitorio (temperatura, lux, luz, movimiento)
			);
			fclose(f);
		}
		else {
			printf("Error: no se pudo abrir el archivo JSON.\n");
		}
		vTaskDelay(pdMS_TO_TICKS(2000));
	}
}

int main(void)
{
	AllocConsole();
	FILE* stream;
	freopen_s(&stream, "CONOUT$", "w", stdout);
	printf("Consola iniciada correctamente. \n");

	vTraceEnable(TRC_START);

	xSystemStateMutex = xSemaphoreCreateMutex();
	xPrintMutex = xSemaphoreCreateMutex();

	if (xSystemStateMutex == NULL || xPrintMutex == NULL) {
		printf("Error al crear mutex\n");
		return 1;
	}

	// Indices estaticos para pasar a las tareas
	static int room_indices[NUM_ROOMS] = { 0, 1, 2 };

	// Crear Tareas de Control
	xTaskCreate(vTaskClimatization, "Climatization", configMINIMAL_STACK_SIZE + 200, NULL, 2, NULL);
	xTaskCreate(vTaskLighting, "Iluminacion", configMINIMAL_STACK_SIZE + 200, NULL, 2, NULL);
	xTaskCreate(vTaskSecurity, "Seguridad", configMINIMAL_STACK_SIZE + 200, NULL, 3, NULL);
	xTaskCreate(vTaskSystemMonitor, "Monitor", configMINIMAL_STACK_SIZE + 200, NULL, 1, NULL);

	// Crear tarea para JSON
	xTaskCreate(vTaskJSON, "JSON", configMINIMAL_STACK_SIZE + 200, NULL, 1, NULL);

	// Crear Tareas de Simulación
	for (int i = 0; i < NUM_ROOMS; i++) {
		char task_name[20];

		sprintf(task_name, "SimTemp%d", i);
		xTaskCreate(vTaskSimTemperature, task_name, configMINIMAL_STACK_SIZE + 200, (void*)&room_indices[i], 1, NULL);

		sprintf(task_name, "SimLight%d", i);
		xTaskCreate(vTaskSimLight, task_name, configMINIMAL_STACK_SIZE + 200, (void*)&room_indices[i], 1, NULL);

		sprintf(task_name, "SimMotion%d", i);
		xTaskCreate(vTaskSimMotion, task_name, configMINIMAL_STACK_SIZE + 200, (void*)&room_indices[i], 1, NULL);
	}

	printf("Iniciando simulacion...\n");
	vTaskStartScheduler();

	printf("La simulacion terminó (no debería pasar). \n");
	for (;;);
}

/* ! Hooks requeridos por FreeRTOS si están habilitados en FreeRTOSConfig.h ! */
void vApplicationMallocFailedHook(void) { for (;;); }
void vApplicationIdleHook(void) {}
void vApplicationTickHook(void) {}
void vAssertCalled(unsigned long line, const char* const file) { for (;;); }

void vApplicationGetIdleTaskMemory(StaticTask_t** ppxIdleTaskTCBBuffer,
	StackType_t** ppxIdleTaskStackBuffer,
	uint32_t* pulIdleTaskStackSize) {
}

void vApplicationGetTimerTaskMemory(StaticTask_t** ppxTimerTaskTCBBuffer,
	StackType_t** ppxTimerTaskStackBuffer,
	uint32_t* pulTimerTaskStackSize) {
}

configRUN_TIME_COUNTER_TYPE ulGetRunTimeCounterValue(void)
{
	return (configRUN_TIME_COUNTER_TYPE)GetTickCount64();
}

void vConfigureTimerForRunTimeStats(void)
{
}

void vGenerateCoreBInterrupt(void* xUpdatedMessageBuffer)
{
	(void)xUpdatedMessageBuffer;
}

void vApplicationDaemonTaskStartupHook(void)
{
}

void vTraceTimerReset(void) {}
uint32_t uiTraceTimerGetFrequency(void) { return 1000; }
uint32_t uiTraceTimerGetValue(void) { return (uint32_t)GetTickCount64(); }
