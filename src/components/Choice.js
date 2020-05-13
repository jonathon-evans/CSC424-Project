import React from 'react';
import '../styles/Choice.css';


import moreInfo from '../images/Linetracker Logo-04.png';



class Choice extends React.Component{


    state = {
        busyStatus: null,
        lineImageRendered: false,
        freshImg: null
    }



    determineStatusColor(){
        switch(this.props.currentBusyStatus){
            case("Very"):
                return 'Choice-Div-Status-Very'
            case("Fairly"):
                return 'Choice-Div-Status-Fairly'
            case("Slightly"):
                return 'Choice-Div-Status-Slightly'
            case("Not"):
                return 'Choice-Div-Status-Not'
            default:
                return 'Choice-Div-Status-Closed'
        }
    }

    renderMoreInfo = () =>{
        this.props.updateMoreInfo(this.props.currentBusyStatus);
    }

    updateLineImage = () => {
        this.props.updateLineImage(); 
    }

    renderLineImage = () => {
        if(this.props.lineImageEnabled){
            let image;
            let location;
            if(this.props.selectedLocation === 'Starbucks'){
                location = 'SB';
                image = this.props.timeStampStar;
            }else{
                location = 'FR';
                image = this.props.timeStampFresh;
            }

            return(
                <div className="RenderLineImage">
                <div className="RenderLineImage-Div">
                <img 
                    className="RenderLineImage-Div-Img"
                    src={`https://linetracker.live/api/ImgDB/${location}${image}.jpg`}
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
                    <p className={`Choice-Div-Status ${this.determineStatusColor()}`}>{this.props.currentBusyStatus}</p>
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