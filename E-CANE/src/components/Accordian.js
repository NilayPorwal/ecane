import React, {Component} from 'react';
import { View, TouchableOpacity, Text, FlatList, StyleSheet,Dimensions} from "react-native";
import { Icon } from 'native-base';
const {height, width} = Dimensions.get('window');

export default class Accordian extends Component{

    constructor(props) {
        super(props);
        this.state = { 
          data: props.data,
          expanded : false,
        }
    }
  
  render() {
    return (
       <View>
            <TouchableOpacity style={[styles.row, {backgroundColor:(this.state.data.Countertype == "TK")?"#CEE196":(this.state.data.Countertype == "GS")?"#f08080":"#b0c4de"}]} onPress={()=>this.toggleExpand()}>
               <View style={{flexDirection:"row", width:"30%"}}>
                <Text style={[styles.title]}>{this.state.data.Activity}</Text>
                <Text style={[styles.title]}> ({this.state.data.counter_no})</Text>
               </View> 
              
               <View style={{width:"30%", alignItems:"flex-start"}}>  
                <Text style={[styles.title]}>{this.state.data.swtm_tk_slip_no}</Text>
               </View>

               <View style={{width:"40%", alignItems:"flex-end"}}>
                   <View  style={{flexDirection:"row"}}>
                    <Text style={[styles.title]}>{this.state.data.lastuseddate}</Text>
                    <Icon type="MaterialIcons" name={this.state.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color="#000000" style={{paddingLeft:5}} />
                   </View>
               </View>
            </TouchableOpacity>
            <View style={styles.parentHr}/>
            {
                this.state.expanded &&
                <View style={{paddingHorizontal:10}}>
                  
                  <View style={{flexDirection:"row", justifyContent:"space-between", marginTop:5}}>
                      <View style={{width:"20%"}}>
                        <Text style={[styles.textStyle, {textAlign:"left"}]}>Farmer :</Text>
                       </View>
                       <View style={{width:"80%"}}> 
                          <Text style={[styles.textStyle, {textAlign:"right"}]}>{this.state.data.FarmerDisplayname}</Text>
                       </View>   
                  </View>

                  <View style={{flexDirection:"row", justifyContent:"space-between", marginVertical:5}}>
                       <View style={{width:"20%"}}>
                        <Text style={[styles.textStyle, {textAlign:"left"}]}>Village :</Text>
                       </View>
                       <View style={{width:"80%"}}> 
                        <Text style={[styles.textStyle, {textAlign:"right"}]}>{this.state.data.VillageDisplayName.trim()}</Text>
                       </View> 
                  </View> 
                
                </View>
            }
            
       </View>
    )
  }

  onClick=(index)=>{
    const temp = this.state.data.slice()
    temp[index].value = !temp[index].value
    this.setState({data: temp})
  }

  toggleExpand=()=>{
    this.setState({expanded : !this.state.expanded})
  }

}

const styles = StyleSheet.create({
    container:{
        justifyContent: 'center',
        alignItems: 'center'
    },
    button:{
        width:'100%',
        height:54,
        alignItems:'center',
        paddingLeft:35,
        paddingRight:35,
        fontSize: 12,
    },
    title:{
        fontSize: width*0.035,
        fontFamily:'Lato-Semibold',
        color: "#000000",
    },
    itemActive:{
        fontSize: 12,
        color: "#008000",
    },
    itemInActive:{
        fontSize: 12,
        color: "#a9a9a9",
    },
    btnActive:{
        borderColor: "#008000",
    },
    btnInActive:{
        borderColor: "#a9a9a9",
    },
    row:{
        flexDirection: 'row',
        justifyContent:'space-between',
        padding:10
    },
    childRow:{
        flexDirection: 'row',
        justifyContent:'space-between',
        backgroundColor: "#808080",
    },
    parentHr:{
        height:1,
        color: "#ffffff",
        width:'100%'
    },
    childHr:{
        height:1,
        backgroundColor: "#d3d3d3",
        width:'100%',
    },
    colorActive:{
        borderColor: "#a9a9a9",
    },
    colorInActive:{
        borderColor: "#a9a9a9",
    },
    textStyle: {
     fontSize: width*0.04, fontFamily: "Lato-Semibold"
    },
    
});