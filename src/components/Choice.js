import React from 'react';
import '../styles/Choice.css';


import moreInfo from '../images/Linetracker Logo-04.png';
import lineImage1 from '../images/Fresh_ex1.jpg'
import lineImage2 from '../images/SB_ex1.jpg';

class Choice extends React.Component{


    state = {
        busyStatus: null,
        lineImageRendered: false
    }

    componentDidMount(){
        const arr = ['Very','Fairly', 'Slightly', 'Not'];
        const choice = arr[Math.floor(Math.random() * 4)]
        this.setState({busyStatus: choice});
    }

    determineStatusColor(){
        switch(this.state.busyStatus){
            case("Very"):
                return 'Choice-Div-Status-Very'
            case("Fairly"):
                return 'Choice-Div-Status-Fairly'
            case("Slightly"):
                return 'Choice-Div-Status-Slightly'
            default:
                return 'Choice-Div-Status-Not'
        }
    }

    renderMoreInfo = () =>{
        this.props.updateMoreInfo(this.state.busyStatus);
    }

    updateLineImage = () => {
        this.props.updateLineImage(); 
    }

    renderLineImage = () => {
        if(this.props.lineImageEnabled){
            return(
                <div className="RenderLineImage">
                <div className="RenderLineImage-Div">
                <img 
                    className="RenderLineImage-Div-Img"
                    src={this.props.selectedLocation === 'Starbucks' ? lineImage2 : lineImage1}
                    alt={`${this.props.selectedLocation} current line`}
                />
            </div>
            </div>
            )
        }
    }

    generateViewText = () => {
        if(this.props.lineImageEnabled){
            return 'Stop Viewing'
        }

        return 'See the line'
    }


    renderChoiceInformation = () => {
        if(this.props.selectedLocation && this.props.moreInfoEnabled === false){
            return(
                <div className="Choice-Div">
                    <div className="Choice-Div-LocationMiddle">
                    <p id="Choice-Div-Location">{this.props.selectedLocation}</p>
                    <p id="Choice-Div-Middle">is currently...</p>
                    {this.renderLineImage()}
                    </div>
                    <p className={`Choice-Div-Status ${this.determineStatusColor()}`}>{this.state.busyStatus}</p>
                    <p id="Choice-Div-Busy">Busy</p>
                    <div className="Choice-Div-See">
                        <button 
                            className={this.props.lineImageEnabled ? "Choice-Div-See-Button Choice-Div-See-Button-Enabled" : 'Choice-Div-See-Button'}
                            onClick={this.updateLineImage}
                            >
                            <span>{this.generateViewText()}</span>
                    </button>
                    </div>
                    <button className="Choice-Div-Button">
                    <img 
                        className="Choice-Div-Button-moreInfo" 
                        src={moreInfo}
                        onClick={this.renderMoreInfo}
                        alt="More Information Icon"
                    />
                    </button>
                </div>
            )
        }
        return;
    }

    render(){
        return(
            <div>
                {this.renderChoiceInformation()}
            </div>
            
        )
    }
}

export default Choice;