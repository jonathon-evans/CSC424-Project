import React from 'react';

import Choice from './Choice';
import MoreInfo from './MoreInfo';

import '../styles/App.css';

import logo from '../images/Linetracker Logo-03.png';
import legend from '../images/Question Mark.png';


const axios = require('axios');



class App extends React.Component{

    state={
        selectedLocation: null,
        moreInfoEnabled: false,
        busyStatus: "Unavailable",
        legendEnabled: false,
        lineImageEnabled: false,
        starbucksImg: null,
        freshImg: null,
        timeStampFresh: null,
        timeStampStar: null,
        busyStatusFresh: null,
        busyStatusStar: null,
        chartDataStar: null,
        chartDataFresh: null,
        chartReady: false,
        currentDay: null
    }

    async componentDidMount(){
        await axios.get('https://linetracker.live/api/timestamp')
        .then(response => {
          this.setState({timeStampFresh: response.data.fresh, timeStampStar: response.data.starb})
        })  
        .catch(e => {
            console.log(e)
        })

        await axios.get(`https://linetracker.live/api/results?loc=FR&time=${this.state.timeStampFresh}`)
        .then(response => {

            let status = this.determineBusyStatus(response.data[0].class);

            this.setState({busyStatusFresh: status})
        })  
        .catch(e => {
            console.log(e)
        })

        this.getCurrentDay();

        await axios.get(`https://linetracker.live/api/results?loc=SB&time=${this.state.timeStampStar}`)
        .then(response => {

            let status = this.determineBusyStatus(response.data[0].class);
            this.setState({busyStatusStar: status})
        })  
        .catch(e => {
            console.log(e)
        })

        let dateStar = this.createDate(this.state.timeStampStar);
        let dateFresh = this.createDate(this.state.timeStampFresh);

        await axios.get(`https://linetracker.live/api/results?loc=FR&time=${dateFresh}&span=hourly`)
        .then(response => {
            let chartFresh = this.updateChartData(response.data)
            this.setState({chartDataFresh: chartFresh})
            // console.log(this.state.chartDataFresh)
        })  
        .catch(e => {
            console.log(e)
        })

        await axios.get(`https://linetracker.live/api/results?loc=SB&time=${dateStar}&span=hourly`)
        .then(response => {
            let chartStar = this.updateChartData(response.data)
            this.setState({chartDataStar: chartStar, chartReady: true})
        })  
        .catch(e => {
            console.log(e)
        })
    }

    //converts timestamp into 8am - 6pm timestamp
    createDate(timestamp){
        return new Date(timestamp * 1000).setHours(18,0,0,0).valueOf() / 1000;
    }

    //convert num from server to status 
    determineBusyStatus(status){
        switch(status){
            case 4: 
                return "Very";
            case 3:
                return "Fairly";
            case 1:
                return 'Not';
            case 0:
                return 'Closed';
            default:
                return 'Slightly';
            
        }
    }

    getCurrentDay(timestamp){

        let date = new Date(timestamp);
        let day;

        switch(date.getDay()){
            case 0: 
                day = 'Sunday'
                break;
            case 1:
                day = 'Monday'
                break;
            case 2:
                day = 'Tuesday'
                break;
            case 3: 
                day = 'Wednesday'
                break;
            case 4:
                day = 'Thursday'
                break;
            case 5:
                day = 'Friday'
                break;
            default:
                day = 'Saturday'
                break;
        }

        this.setState({currentDay: day})
    }

    //create correct output for moreinfo.js 
    //convert from unix to js time
    //add am/pm based on time
    updateChartData(chartData){
        let output = [];
        for(const prop in chartData){
            let hour = new Date(prop * 1000).getHours();
            if(hour > 12){
                hour -= 12;
                hour = `${hour} PM`
            }else{
                hour = `${hour} AM`
            }
            output.push({name: hour, value: `${Math.round(chartData[prop])}`})
        }

        return output;
    }

 
    onButtonClick = (event) => {
        this.setState({selectedLocation: event.target.name, moreInfoEnabled: false, legendEnabled: false, lineImageEnabled: false})
    }

    displayMoreInfo = () => {
        if(this.state.moreInfoEnabled && this.state.chartReady){
            return <MoreInfo  
                selectedLocation={this.state.selectedLocation} 
                busyStatus={this.state.selectedLocation === 'Starbucks'? this.state.busyStatusStar : this.state.busyStatusFresh}
                updateMoreInfo={this.updateMoreInfo}
                chartDataStar={this.state.chartDataStar}
                chartDataFresh={this.state.chartDataFresh}
                currentDay={this.state.currentDay}
                />
        }else if(this.state.moreInfoEnabled && !this.state.chartReady){
            return(
                <div className="Choice-Div">
                    <div className="Choice-Div-LocationMiddle">
                    <p id="Choice-Div-Location">Gathering Data</p>
                    </div>
                </div>
            )
        }
        return null;
    }
    updateMoreInfo = (busyStatus = null) => {
        this.setState({moreInfoEnabled: !this.state.moreInfoEnabled, busyStatus: busyStatus, legendEnabled: false, lineImageEnabled: false})
    }

    updateLineImage = () =>{
        this.setState({lineImageEnabled: !this.state.lineImageEnabled})
    }

    renderLegend = () => {
        if(this.state.legendEnabled)
            return(
                <div className='App-Legend-Div'>
                    <div className='App-Legend-Content'>
                        <h1>Busy Status</h1>
                        <h4 className='App-Legend-Content-Based'><em>Based on people in line</em></h4>
                        <ul className='App-Legend-Content-Status'>
                            <li>Very Busy: <span id="App-Legend-Content-Status-VeryBusy">8+</span></li>
                            <li>Fairly Busy: <span id="App-Legend-Content-Status-FairlyBusy">5 - 8</span></li>
                            <li>Slightly Busy: <span id="App-Legend-Content-Status-SlightlyBusy">1 - 4 </span></li>
                            <li>Not Busy: <span id="App-Legend-Content-Status-NotBusy">0</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        return null
    }

    render(){
        return(
            <div className= 'center'>
                <div className= 'App-Div'>
                    <div className="App-Overlay">
                        <div className="App-Overlay-Content">
                    {/* <h1 className="App-Logo">Linetracker</h1> */}
                    <img className="App-Logo" src={logo} alt='logo'/>
                        <div className="App-Div-Buttons">
                            <button 
                                className={this.state.selectedLocation === "The Fresh" ? 'App-SelectedButton': 'App-Div-ChoiceButton'}
                                name="The Fresh"    
                                onClick={this.onButtonClick}
                            >
                                The Fresh
                            </button>
                            <button 
                                className={this.state.selectedLocation === "Starbucks" ? 'App-SelectedButton': 'App-Div-ChoiceButton'}
                                name="Starbucks"
                                onClick={this.onButtonClick}
                            >
                                Starbucks    
                            </button>
                            </div>
                        </div>
                        </div>
                        {this.renderLegend()}
                    <Choice 
                        selectedLocation={this.state.selectedLocation} 
                        moreInfoEnabled={this.state.moreInfoEnabled} 
                        updateMoreInfo={this.updateMoreInfo}
                        lineImageEnabled={this.state.lineImageEnabled}
                        updateLineImage={this.updateLineImage}
                        timeStampStar={this.state.timeStampStar}
                        timeStampFresh={this.state.timeStampStar}
                        currentBusyStatus={this.state.selectedLocation === 'Starbucks'? this.state.busyStatusStar : this.state.busyStatusFresh}
                    />
                    {this.displayMoreInfo()}
                </div>
                <button className={this.state.legendEnabled ? 'App-Legend App-Legend-Displayed' : 'App-Legend'}
                    onClick={()=> this.setState({legendEnabled: !this.state.legendEnabled})}
                >
                    <img 
                        className='App-Legend-Icon'
                        src={legend}
                        alt='legend icon'
                        />
                </button>
            </div>
        )
    }
}


export default App;