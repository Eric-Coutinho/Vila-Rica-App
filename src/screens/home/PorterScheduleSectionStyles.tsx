import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  section: { 
    marginTop: 12, 
    marginBottom: 56 
},
  title: { 
    fontSize: 20, 
    fontWeight: "700", 
    marginBottom: 8 
},
  table: {
    borderWidth: 1,
    borderColor: "#d8dee7",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#d8dee7",
    backgroundColor: "#fff",
  },
  header: { 
    backgroundColor: "#466CA5" 
},
  headerText: { 
    color: "#fff", 
    fontWeight: "700" 
},
  day: { 
    flex: 2, 
    color: "#222", 
    fontSize: 15, 
    fontWeight: "600" 
},
  hours: { 
    flex: 3, 
    color: "#333", 
    fontSize: 15, 
    lineHeight: 22 
},
  note: { 
    fontSize: 16, 
    color: "#444" 
},
  retry: { 
    paddingVertical: 10, 
    color: "#375c95", 
    fontWeight: "600" 
},
});
