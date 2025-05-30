import CustomScreenHeader from '@/Components/CustomScreenHeader'
import { useAuth } from '@/lib/AuthProvider'
import { useAvatarUpload } from '@/lib/AvatarUplaod'
import { useProfiles } from '@/lib/fetchProfiles'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import { Button, Input } from '@rneui/themed'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { supabase } from '../lib/supabase'

export default function Account() {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [fightingStyle, setFightingStyle] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [availability, setAvailability] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bio, setBio] = useState('')
  const [fullName, setfullName] = useState('')

  ///useProfiles and useAvatarUpload



  //AVAILABILITY TIME:
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const { updateProfileToFix } = useProfiles('account');
  //toggler of time popup
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)


  const router = useRouter()
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null)

  const { session, isLoading } = useAuth()

  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  const { uploadAvatar, uploading } = useAvatarUpload()

  useEffect(() => {
    if (session) {
      getProfile()
      initLocation()

    }
  }, [session])



  async function initLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return
    const loc = await Location.getCurrentPositionAsync({})



    const newRegion = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };



    setMarker({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    setRegion(newRegion);

  }


  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')
      const { data, error, status } = await supabase
        .from('profiles')
        .select('username, full_name, website, avatar_url, location, bio, fighting_style, experience_level, availability')
        .eq('id', session.user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
        console.log("avatar_url: " + data.avatar_url)
        if (data.location?.coordinates) {
          const [lng, lat] = data.location.coordinates
          setMarker({ latitude: lat, longitude: lng })
        }

        setBio(data.bio);
        setFightingStyle(data.fighting_style);
        setExperienceLevel(data.experience_level?.toString());
        // setAvailability(JSON.stringify(data.availability));
        setfullName(data.full_name)

        if (data.availability) {
          setAvailableDays(data.availability.days || [])
          if (data.availability.time) {
            const [start, end] = data.availability.time.split('-')

            const now = new Date()
            const startDt = new Date(now)
            const endDt = new Date(now)
            const [startHours, startMinutes] = start.split(':').map(Number)
            const [endHours, endMinutes] = end.split(':').map(Number)
            startDt.setHours(startHours, startMinutes)
            endDt.setHours(endHours, endMinutes)
            setStartTime(startDt)
            setEndTime(endDt)
          }
        }


      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')


      if (!marker) {
        Alert.alert('Please pick a location on the map.')
        return
      }


      //REMEMBER: we send geojson format to supabase but we have special function 
      //inside supabase that converts geograpy dtype into latitude and longitde
      const geojson = `SRID=4326;POINT(${marker.longitude} ${marker.latitude})`;

      if (!availableDays && !startTime && !endTime) {
        Alert.alert('Please pick time availability to fight.')
        return
      }

      const availabilityJson = {
        days: availableDays,
        time: `${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, '0')}-${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`
      };

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url: avatarUrl,
        location: geojson,
        bio,
        fighting_style: fightingStyle,
        experience_level: parseInt(experienceLevel),
        availability: availabilityJson,
        updated_at: new Date(),
        full_name: "anon"
      };




      //verify first here if ok uncomment process
      console.log(updates)

      const error = await updateProfileToFix(updates)
      console.log("AWAIT DONE")
      if (error) {
        throw error
      }

      router.replace('/(tabs)')

    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (marker) {
      console.log(marker)

    }
  }, [marker])


  const formatTime = (date: Date) =>
    `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`


  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>

      <View style={styles.container}>
        <CustomScreenHeader title="ABOUT ME" showBackButton={true} />

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Input label="Email" value={session?.user?.email} disabled />
        </View>

        <View style={styles.verticallySpaced}>
          <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
        </View>

        <View style={styles.verticallySpaced}>
          <Input label="Website" value={website || ''} onChangeText={(text) => setWebsite(text)} />
        </View>

        <View style={styles.verticallySpaced}>
          <Input label="Bio" value={bio || ''} onChangeText={(text) => setBio(text)} />
        </View>

        <View style={styles.verticallySpaced}>
          <Input label="Fighting Style" value={fightingStyle || ''} onChangeText={(text) => setFightingStyle(text)} />
        </View>

        <View style={styles.verticallySpaced}>
          <Input label="Experience Level" disabled />
          <Picker
            selectedValue={experienceLevel}
            onValueChange={(itemValue) => setExperienceLevel(itemValue)}
          >
            <Picker.Item label="Select experience level" value="" />
            <Picker.Item label="Beginner" value="1" />
            <Picker.Item label="Intermediate" value="2" />
            <Picker.Item label="Expert" value="3" />
          </Picker>
        </View>


        <View style={styles.verticallySpaced}>
          <Text>Availability Days</Text>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <Button
              key={day}
              type={availableDays.includes(day) ? 'solid' : 'outline'}
              title={day}
              onPress={() => {
                setAvailableDays((prev) =>
                  prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                )
              }}
              containerStyle={{ margin: 2 }}
            />
          ))}
        </View>

        <View style={styles.verticallySpaced}>
          <Text style={styles.label}>Start Time</Text>
          <Button onPress={() => setShowStartPicker(true)}>
            <Input
              value={formatTime(startTime)}
              editable={false}
              rightIcon={{ name: 'access-time', type: 'material' }}
            />
          </Button>
          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartPicker(false)
                if (selectedDate) {
                  setStartTime(selectedDate)
                }
              }}
            />
          )}
        </View>

        <View style={styles.verticallySpaced}>
          <Text style={styles.label}>End Time</Text>
          <Button onPress={() => setShowEndPicker(true)}>
            <Input
              value={formatTime(endTime)}
              editable={false}
              rightIcon={{ name: 'access-time', type: 'material' }}
            />
          </Button>
          {showEndPicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndPicker(false)
                if (selectedDate) {
                  setEndTime(selectedDate)
                }
              }}
            />
          )}
        </View>


        {/* Avatar Section */}
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Text style={styles.label}>Avatar</Text>
          {avatarUrl ? (
            <View style={styles.avatarContainer}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <Button
                title={uploading ? 'Uploading...' : 'Change Avatar'}
                onPress={() => {
                  if (session?.user?.id) {
                    uploadAvatar(session.user.id, setAvatarUrl)
                  } else {
                    Alert.alert('Error', 'User not authenticated')
                  }
                }}
                disabled={uploading}
              />
            </View>
          ) : (
            <Button
              title={uploading ? 'Uploading...' : 'Change Avatar'}
              onPress={() => {
                if (session?.user?.id) {
                  uploadAvatar(session.user.id, setAvatarUrl)
                } else {
                  Alert.alert('Error', 'User not authenticated')
                }
              }}
              disabled={uploading}
            />
          )}
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region ?? {
              latitude: 0,
              longitude: 0,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}

            onPress={(e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
              setMarker(e.nativeEvent.coordinate)
              console.log(e.nativeEvent.coordinate)
            }
            }
          >
            {marker && <Marker coordinate={marker} />}
          </MapView>
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title={loading ? 'Loading ...' : 'Update'}
            onPress={() => updateProfile()}
            disabled={loading}
          />
        </View>

        <View style={styles.verticallySpaced}>
          <Button title="Sign Out" onPress={async () => {
            console.log("Sign OutED")
            await supabase.auth.signOut()
            router.replace('/Auth')
          }} />
        </View>
      </View>
    </ScrollView>

  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },

  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  mapContainer: { height: 300, marginVertical: 16 },
  map: { flex: 1 },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#f0f0f0',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  changeAvatarButton: {
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
})