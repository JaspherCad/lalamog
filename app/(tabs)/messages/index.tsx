import { Profile, useProfiles } from '@/lib/fetchProfiles';
import { useAuth } from '@/lib/AuthProvider';
import { RootStackParamList } from '@/types';
import { useNavigation } from '@react-navigation/native';
import { FlatList, TouchableOpacity, Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRouter } from 'expo-router';


// type MatchListNavigationProp = StackNavigationProp<RootStackParamList, 'messages/[matchId]'>;


export default function MessageMatchedProfiles() {
    // const { session } = useAuth()
  const { matchedProfiles } = useProfiles('messages');
  const router = useRouter();

    // const openChat = (profile: Profile) => {
    //     navigation.navigate('messages/[matchId]', {
    //         matchId: profile.id,
    //         receiverId: "SASSUKE",
    //     });
    // };

    const openChat = (profile: Profile) => {
        //to toplevel chat screen (outside tabs)
        router.push(`/messages/${profile.id}`); 
    };

//     app/
// ├── messages/
// │   └── [matchId].tsx                            router.push(`/messages/${profile.id}`); 
// ├── (tabs)/
// │   └── messages/
// │       └── index.tsx    ✅-> lists of matched (now we here)


    return (
        <FlatList
            data={matchedProfiles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.matchItem}
                    onPress={() => openChat(item)}
                >
                    <Text>{item.username}</Text>
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    matchItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});