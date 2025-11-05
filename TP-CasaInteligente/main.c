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
#include "FreeRTOS.h"
#include "task.h"
#include "timers.h"
#include "semphr.h"
#include <stdint.h>
#include <windows.h>
#include "trcRecorder.h"

void tareaDeEjemplo(void* pvParameters)
{
	for (;;)
	{
		printf("Ejecutando tarea...\n");
		vTaskDelay(pdMS_TO_TICKS(1000));
	}
}

int main(void)
{
	// Creo consola para mostrar los prints.
	AllocConsole();                
	FILE* stream;
	freopen_s(&stream, "CONOUT$", "w", stdout);
	printf("Consola iniciada correctamente. \n");

	//Inicializo el trace recorder antes de crear la tarea.
	vTraceEnable(TRC_START);

	// Creo la tarea e inicio el scheduler.
	xTaskCreate(tareaDeEjemplo, "Tarea1", configMINIMAL_STACK_SIZE + 100, NULL, 1, NULL);
	vTaskStartScheduler();

	printf("El scheduler terminó (no debería pasar). \n");
	for (;;);
}

/* ! Hooks requeridos por FreeRTOS si están habilitados en FreeRTOSConfig.h ! */
/* Si al terminar el proyecto no usamos nada de esto, desactivar el flag en el archivo de configuracion y eliminar funciones vacias */
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