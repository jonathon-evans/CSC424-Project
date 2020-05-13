import React from 'react';

import {ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar, Cell } from 'recharts';

import '../styles/MoreInfo.css';
import backIcon from '../images/Arrow.png';
// import backgroundImage from '../images/Skinny Img.png'

class MoreInfo extends React.Component{

    state = {
        chartData: []
    }

    componentDidMount(){
       
    }

    getWeekDay = () => {
        const d = new Date();
        switch(d.getDay()){
            case 0: 
                return 'Sunday'
            case 1:
                return 'Monday'
            case 2:
                return 'Tuesday'
            case 3: 
                return 'Wednesday'
            case 4:
                return 'Thursday'
            case 5:
                return 'Friday'
            default:
                return 'Saturday'
        }
    }



    renderChart = () => {
        let chart = this.props.selectedLocation === "Starbucks" ? this.props.chartDataStar : this.props.chartDataFresh;
        return (
        <div className="RenderChart-Div">
        <ResponsiveContainer>
            <BarChart  data={this.props.selectedLocation === "Starbucks" ? this.props.chartDataStar : this.props.chartDataFresh} margin={{top:25, right: 5, left: 0, bottom:0}}>
            <CartesianGrid strokeDasharray="2 2" />
            <XAxis dataKey="name"  tick={{fill: '#EDE3E4'}}/>
            <YAxis label={{value: this.getWeekDay(), angle: -90, position: 'center', fill: '#EDE3E4', fontSize:'1.45em'}} tick={{fill: '#EDE3E4'}} domain={[0, 4]}/>
            <Bar dataKey="value" fill="#55d33f">
                { 
                    chart.map((entry, index) => {
                    const color = entry.value === '1' ? '#3fd34e':
                    entry.value === '2' ? '#FFD275':
                    entry.value === '3' ? '#d34e3f':
                    entry.value === '4' ?  '#D33F49' : 'rgba(211, 63, 73, 0)';
                    return <Cell fill={color} key={index}/>;  
                    })
                }
            </Bar>
        </BarChart>
        </ResponsiveContainer>
        </div>
        )

    }
    
    render(){
    return(
        <div className="MoreInfo-Parent-Div">
            {/* <div className="MoreInfo-Div-P">
                <div className="MoreInfo-Div-P-Location">
                    <p>{this.props.selectedLocation}</p> 
                </div>
                <div className="MoreInfo-Div-P-Status">
                    <p>{`${this.props.busyStatus.toLowerCase()}`} busy</p>
                </div>
        </div> */}
        <div className="MoreInfo-Div">
            <div  className="Div-Barchart">
            {this.renderChart()}
            </div>
            <div className="Div-Button-Container">
                <button className="Div-Button">
                <img 
                    className="Div-Button-Return" 
                    src={backIcon}
                    onClick={()=> this.props.updateMoreInfo()}
                    alt="Back Icon"
                    />
                </button>
                {/* <img className="Div-Image-Line" src={backgroundImage} alt="people in line"/> */}
                <p id="Div-Button-Location">Traffic at {this.props.selectedLocation}</p>
            </div>
            </div>
        </div>
        )
    }
}

export default MoreInfo;


// #D33F49;
// #d34e3f;
// #3fd34e;
// #55d33f;