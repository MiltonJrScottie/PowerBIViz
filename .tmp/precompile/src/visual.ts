import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;

module powerbi.extensibility.visual.powerBIVisual1D28CB10BD8040A98F545F6699A510D2  {
    "use strict";

    interface DataPoint {
        event: string;
        timeStamp: Date;
    };

    interface ViewModel {
        dataPoints: DataPoint[];
        maxTimeStamp: Date;
    };

    export class Visual implements IVisual {
        private host: IVisualHost;
        private svg: d3.Selection<SVGElement>;
        private container: d3.Selection<SVGElement>;
        private horizontalLine: d3.Selection<SVGElement>;
        private eventName: d3.Selection<SVGElement>;
        private eventDate: d3.Selection<SVGElement>;
		private verticalLine:d3.Selection<SVGElement>;
        private labelBoxes:d3.Selection<SVGElement>;
        private labelText:d3.Selection<SVGElement>;
        private secondEvent: d3.Selection<SVGElement>;
        private viewModel: ViewModel;

        private settings = {

            lineColor: {
                line: {
                    color: {
                        default: "#018A80",
                        value: "#000000"
                    }
                }
            },
            events: {
                text: {
                    color: {
                        default: "#777777",
                        value: "#777777"
                    }//,
                    //fontSize: {
                    //    default: 20,
                    //    value: 20
                    //}
                }
            },
            timestamps: {
                text: {
                    color: {
                        default: "000000",
                        value: "000000"
                    }
                }
            },
            dataFont: {
                text: {
                    fontSize: {
                        default: 20,
                        value: 20
                    }
                }
            }
        }

        constructor(options: VisualConstructorOptions) {
			let svg=this.svg=d3.select(options.element)
                .append("svg")
                .style("background", "rgb(249, 250, 252)")
                //.style("border","2px black solid")
		    this.horizontalLine=svg.append("line")
            .style("stroke-width","6")

            this.verticalLine=svg.append("g")
            this.eventName = svg.append("g")
            this.eventDate=svg.append("g")
            this.labelBoxes=svg.append("g")
            this.labelText=svg.append("g")
            this.secondEvent = svg.append("g")
        }

        private getDateRatio(options: VisualUpdateOptions): number[] {
            
            let eventDates = options.dataViews[0].categorical.categories[0].values;
            let ratio = [1];
            let difference = [1];
            for (var i = 0; i < eventDates.length - 1; i++) {
                let eventDate: Date = new Date(eventDates[i].toString());
                let nextEventDate: Date = new Date(eventDates[i + 1].toString());
                let eventTime = eventDate.getTime();
                let nextEventTime = nextEventDate.getTime();
                difference[i] = ((nextEventTime / 3600000) - (eventTime / 3600000));
                if (i == 0) {
                    ratio[i] = 1;
                }
                else {
                    ratio[i] = difference[i] / difference[0];
                }

            }
            return ratio;
        }

        public update(options: VisualUpdateOptions) {

            this.updateSettings(options);
            this.viewModel = this.getViewModel(options);
            
            let viewportWidth=options.viewport.width;
            let viewportHeight=options.viewport.height;
            let verticalLineHeight = (viewportHeight / 1.5) - (viewportHeight/3);
            let initialOffset = 100;
            let fontSize = this.settings.dataFont.text.fontSize.value;/*this.settings.events.text.fontSize.value;*/ //0.02 * options.viewport.width;
            let totalElements = [1, 2];
            let lineColor = this.settings.lineColor.line.color.value;
            let textColors = [this.settings.events.text.color.value /*Event and related text*/, this.settings.timestamps.text.color.value /*Timestamp and related text*/];
            let labelTexts=[options.dataViews[0].categorical.values[0].source.displayName ,options.dataViews[0].categorical.categories[0].source.displayName];
        
            let viewModel = this.getViewModel(options);
            let ratioArray=this.getDateRatio(options);
            let datesArray = options.dataViews[0].categorical.categories[0].values;
            let minPixels = this.getminimumPixels(viewportWidth,ratioArray,initialOffset );//viewportWidth/6.5;

            this.removeElements();                                      //removes the old elements

            this.svg
			.attr("height",options.viewport.height)                     
            .attr("width",options.viewport.width)
           
			this.horizontalLine
			.attr("x1",20)
			.attr("y1",viewportHeight/1.5)                              //Draws horizontal line
			.attr("x2",viewportWidth-20)
            .attr("y2", viewportHeight / 1.5)
            .style("stroke",lineColor);

            this.labelBoxes.selectAll("rect")                          //Draws labelboxes
            .data(totalElements)
            .enter()
                    .append("rect")
                    .attr("x",function(d,i){
                        if(i==0){
                            return 20;
                        }
                        else{
                            return viewportWidth/4;
                        }
                    })
                    .attr("y",function(d,i){
                        return viewportHeight/10;
                    })
                    .attr("height",function(i){
                        if(viewportHeight<322 || viewportWidth<400){
                            return 0
                        }
                        else{
                            return 15;
                        }
                    })
                    .attr("width",15)
                    .style("fill",function(d,i){
                        return textColors[i];
                    })
            
            this.labelText.selectAll("text")                           //Writes the text next to label boxes            
                .data(totalElements)
                .enter()
                    .append("text")
                    .text(function(d,i){
                        return labelTexts[i];
                    })
                    .attr("x",function(d,i){
                        if(i==0){
                            return 100;
                        }
                        else
                        {
                            return (viewportWidth/4)+100;
                        }   
                    })
                    .attr("y",function(d,i){
                        return viewportHeight/10+15;
                    })
                    .attr("text-anchor","middle")
                    .attr("font-size",function(i){
                        if (viewportHeight < 322 || viewportWidth < 400){
                            return 0;
                        }
                        else{
                            return fontSize;
                        }
                    })
                    .style("fill","black")

            this.verticalLine.selectAll("line")                        //Draws Vertical lines
                .data(viewModel.dataPoints)
			    .enter()
			        .append("line")                                     
					.attr("x1",function(d,i){
					    if(i==0){
							return initialOffset;                            
						}
						else{
							var x0=initialOffset;
							for(var j=0;j<i;j++){
								 x0=x0+(ratioArray[j]*minPixels);
							}
							return x0;
						}   
					})
                    .attr("y1",options.viewport.height/1.5)
					.attr("x2",function(d,i){
						if(i==0){
							return initialOffset;                            
						}
						else{
							var x0=initialOffset;
							for(var j=0;j<i;j++){
								 x0=x0+(ratioArray[j]*minPixels);
							}
							return x0;
					    }
					})
                    .attr("y2", verticalLineHeight)
                    .style("stroke", lineColor)
                    .style("stroke-width", "4")
            
                    var event:string[];
                    var partEvent=[""];
                  
            this.eventName.selectAll("text")                           //Writes event names
                .data(viewModel.dataPoints)
                .enter()
                    .append("text")
                    .text(function (d, i){
                         event=d.event.split(" ");
                         if(event.length>1){
                            partEvent[i]=event[1];
                            return event[0];
                         }
                         else if(event.length<2){
                            return d.event;
                         }
                    })
                    .attr("x",function(d,i){
                        if(i==0){
                            return initialOffset;                            
                        }
                        else{
                            var x0=initialOffset;
                            for(var j=0;j<i;j++){
                                x0=x0+(ratioArray[j]*minPixels);
                            }
                            return x0;
                        }
                    })
                    .attr("y",function(d,i){
                        event=d.event.split(" ");
                        if(event.length>1){
                            return verticalLineHeight-35;
                        }
                        else if(event.length<2){
                            return verticalLineHeight-5;
                        }
                    })
                    .attr("text-anchor","middle")
                    .attr("font-size",fontSize)
                    .style("fill", textColors[0])
                    .style("font-weight","bold")

            this.secondEvent.selectAll("text")                         //Writes the second part of the longer event name
                .data(partEvent)
                .enter()
                    .append("text")
                    .text(function (d, i) {
                        return partEvent[i];
                    })
                    .attr("x",function(d,i){
                        if(i==0){
                            return initialOffset;                            
                        }
                        else{
                            var x0=initialOffset;
                            for(var j=0;j<i;j++){
                                x0=x0+(ratioArray[j]*minPixels);
                            }
                            return x0;
                        }
                    })
                    .attr("y",verticalLineHeight-5)
                    .attr("text-anchor","middle")
                    .attr("font-size",fontSize)
                    .style("fill", textColors[0])
                    .style("background", "red")
                    .style("font-weight", "bold")

            this.eventDate.selectAll("text")                           //Put the dates on the appropriate position
                .data(viewModel.dataPoints)
                .enter()
                    .append("text")
                    .text(function (d, i) {
                        let tempDate:Date = new Date(d.timeStamp .toString());
                        let minute=tempDate.getMinutes();
                        let stringMinute="";
                        if(minute==0){
                            stringMinute="00";
                        }
                        else{
                            stringMinute=minute.toString();
                        }
                        return  tempDate.getMonth()+1+"/"+tempDate.getDate()+ "/" + tempDate.getFullYear()+" "+tempDate.getHours()+":"+stringMinute;
                    })
                    .attr("x",function(d,i){
                        if(i==0){
                            return initialOffset;                            
                        }
                        else{
                            var x0=initialOffset+10;
                            for(var j=0;j<i;j++){
                                x0=x0+(ratioArray[j]*minPixels);
                            }
                            return x0;
                        }
                    })
                    .attr("y",(options.viewport.height/1.5)+25)
                    .attr("text-anchor","middle")
                    .attr("font-size", fontSize)
                    .style("fill", textColors[1])
        }

        private getminimumPixels(width: number, ratioArray: number[], initialOffset): number {  //funtion to calculate pixels(width) of the smallest width between two vertical lines
            var minPixels = width / ((ratioArray.length)/2);
            var maxBoundary = (width - (initialOffset + 30));
            var maxX = initialOffset;
            var divisor = 0;
            do {
                maxX = initialOffset;
                for (var j = 0; j < ratioArray.length; j++) {

                    maxX = maxX + (ratioArray[j] * minPixels);
                }
                if (maxX > maxBoundary) {
                    minPixels = width / (ratioArray.length + divisor);
                    divisor = divisor + 0.1;
                }
            } while (maxX > maxBoundary && width>240); 
            if (width < 250) {
                return 0;
            }
            return minPixels;
        }

        private removeElements() {                                     //function to remove the elements from the svg

            this.eventDate.selectAll("text").remove()
            this.labelBoxes.selectAll("rect").remove()
            this.labelText.selectAll("text").remove()
            this.verticalLine.selectAll("line").remove()
            this.eventName.selectAll("text").remove()
            this.secondEvent.selectAll("text").remove()
        }

        private updateSettings(options: VisualUpdateOptions) {

            this.settings.lineColor.line.color.value = DataViewObjects.getFillColor(options.dataViews[0].metadata.objects, { objectName: "lineColor", propertyName: "color" }, this.settings.lineColor.line.color.default);
            this.settings.events.text.color.value = DataViewObjects.getFillColor(options.dataViews[0].metadata.objects, { objectName: "events", propertyName: "color" }, this.settings.events.text.color.default);
            this.settings.dataFont.text.fontSize.value = DataViewObjects.getValue(options.dataViews[0].metadata.objects, { objectName: "dataFont", propertyName: "fontSize" }, this.settings.dataFont.text.fontSize.default);
            //this.settings.events.text.fontSize.value = DataViewObjects.getValue(options.dataViews[0].metadata.objects, { objectName: "events", propertyName: "fontSize" }, this.settings.events.text.fontSize.default);
            this.settings.timestamps.text.color.value = DataViewObjects.getFillColor(options.dataViews[0].metadata.objects, { objectName: "timestamps", propertyName: "color" }, this.settings.timestamps.text.color.default);
        }
        

        private getViewModel(options: VisualUpdateOptions): ViewModel {

            let dv = options.dataViews;

            let viewModel: ViewModel = {
                dataPoints: [],
                maxTimeStamp: new Date("January 1, 2000 12:00:00")
            };

            if (!dv
                || !dv[0]
                || !dv[0].categorical
                || !dv[0].categorical.categories
                || !dv[0].categorical.categories[0].source
                || !dv[0].categorical.values)
                return viewModel;

            let view = dv[0].categorical;
            let categories = view.categories[0];
            let values = view.values[0];

            for (let i = 0, len = Math.max(categories.values.length, values.values.length); i < len; i++) {
                viewModel.dataPoints.push({
                    event: <string>values.values[i],
                    timeStamp: <Date>categories.values[i],

                });
            }

            viewModel.maxTimeStamp = d3.max(viewModel.dataPoints, d => d.timeStamp);

            return viewModel;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions):
            VisualObjectInstanceEnumeration {

            let propertyGroupName = options.objectName;
            let properties: VisualObjectInstance[] = [];

            switch (propertyGroupName) {

                case "lineColor":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            color: this.settings.lineColor.line.color.value
                        },
                        selector: null
                    });
                    break;

                case "events":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            color: this.settings.events.text.color.value,
                            //fontSize: this.settings.events.text.fontSize.value
                        },
                        selector: null
                    });
                    break;

                case "timestamps":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            color: this.settings.timestamps.text.color.value
                        },
                        selector: null
                    });
                    break;

                case "dataFont":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            fontSize: this.settings.dataFont.text.fontSize.value
                        },
                        selector: null
                    });
                    break;
            }

            return properties;
        }
    }
}