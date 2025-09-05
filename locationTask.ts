import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import { api } from './axios'

const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error(error)
        return
    }

    const { locations } = data
    console.log(locations, 'location task')
    if (locations && locations.length > 0) {
        const { latitude, longitude } = locations[0].coords

        await api.post('', {})
    }
})

export const startBackgroundLocation = async () => {
    // const {status: bgStatus} = await Location.requestBackgroundPermissionsAsync()

    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
    console.log(isRunning, 'location task running?')
    if (!isRunning) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 10,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
                notificationTitle: 'Distress',
                notificationBody: 'Location is being used in the background'
            }
        })
    }
}