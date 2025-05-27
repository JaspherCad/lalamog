import CustomScreenHeader from "@/Components/CustomScreenHeader";
import { Text, View } from "react-native";

export default function About() {
  return (
    <>

    <CustomScreenHeader title="ABOUT ME" showBackButton={true} />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >

        <Text>abouts.</Text>
      </View>
    </>

  );
}


