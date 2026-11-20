import { StyleSheet } from "react-native";
import { styles as residents } from "../residents/styles";
export const styles = StyleSheet.create({
  ...residents,
  screen: { 
        flex: 1, 
        backgroundColor: "#fff" 
    },
    cards: { 
        marginTop: 14 
    },
    editor: { 
        gap: 6, 
        marginTop: 8 
    },
    cancel: { 
        alignItems: "center", 
        padding: 10 },
    cancelText: { 
        color: "#466CA5", 
        fontWeight: "600" 
    },
    error: { 
        color: "#9d2222", 
        marginVertical: 8 
    },
});
