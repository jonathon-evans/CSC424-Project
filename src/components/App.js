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
        busyStatus: null,
        legendEnabled: false,
        lineImageEnabled: false,
        starbucksImg: null,
        freshImg: null
    }

    async componentDidMount(){
        //http://linetracker.live/api/fresh
        //http://linetracker.live/api/starb

        await axios.get('http://linetracker.live/api/fresh')
        .then(response => {
            // console.log(response)
        //    return response.data.blob();

        })
        .then(blob => {
            // let img = URL.createObjectURL(blob);
            // console.log(img)
        })
        .catch(e => {
            console.log(e)
        })


    }

    onButtonClick = (event) => {
        this.setState({selectedLocation: event.target.name, moreInfoEnabled: false, legendEnabled: false, lineImageEnabled: false})
    }

    displayMoreInfo = () => {
        if(this.state.moreInfoEnabled){
            return <MoreInfo  
                selectedLocation={this.state.selectedLocation} 
                busyStatus={this.state.busyStatus}
                updateMoreInfo={this.updateMoreInfo}
                />
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