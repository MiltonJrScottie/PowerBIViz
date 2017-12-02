import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;

module powerbi.extensibility.visual {
    "use strict";

    interface DataPoint {
        event: string;
        timeStamp: Date;
        color: string;
        identity: powerbi.visuals.ISelectionId;
        highlighted: boolean;
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

        constructor(options: VisualConstructorOptions) {
			let svg=this.svg=d3.select(options.element)
						.append("svg")
		

            this.horizontalLine=svg.append("line")
            .style("stroke-width","6")

            this.verticalLine=svg.append("g")
            this.eventName = svg.append("g")
            this.eventDate=svg.append("g")
            this.labelBoxes=svg.append("g")
            this.labelText=svg.append("g")
            this.secondEvent=svg.append("g")
        }

        private getDateRatio(options: VisualUpdateOptions): number[] {
            
                        let eventDates = options.dataViews[0].categorical.categories[0].values;
                        let ratio = [1];
                        let ratio1 = [1];
                        let difference = [1];
                        for (var i = 0; i < eventDates.length-1; i++) {
                           
                           let tdate: Date = new Date(eventDates[i].toString());
                            let tdate1: Date = new Date(eventDates[i + 1].toString());
                            let time = tdate.getTime();
                            let time2 = tdate1.getTime();
                            difference[i] = ((time2 / 3600000) - (time / 3600000));
                           if (i==0) {
                                ratio[i] = 1;
                            }
                           else {
                                ratio[i] = difference[i] / difference[0];
                            }
            
                        }
                   
                        for (var k = 0; k< eventDates.length; k++) {
                            
                           if (k==0){
            
                               ratio1[k] = 1;//eventDates[1].toString(); 
                            }
                            else{
                                ratio1[k] = ratio[k-1]//(ratio[i - 1]).toString();
                           }
                        }
                        return ratio1;
                    }

       

        public update(options: VisualUpdateOptions) {

            this.viewModel = this.getViewModel(options);
            
            let viewportWidth=options.viewport.width;
            let viewportHeight=options.viewport.height;
            let minPixels=viewportWidth/6.5;
            let verticalLineHeight=(options.viewport.height / 1.5) - (options.viewport.height/3);
            let initialOffset=100;
            let fontSize= 0.02 * options.viewport.width;
            let totalElements=[1,2];
            let lineColor="rgb(30, 142, 159)";
            let colors=["rgb(41, 130, 23)","black"];
           
            let texts=[options.dataViews[0].categorical.values[0].source.displayName ,options.dataViews[0].categorical.categories[0].source.displayName];
            let eventColors="rgb(41, 130, 23)";
            let dateColors="black";
            
            let viewModel = this.getViewModel(options);
            let ratioArray=this.getDateRatio(options);
            let datesArray = options.dataViews[0].categorical.categories[0].values;

            this.eventDate.selectAll("text").remove()
            this.labelBoxes.selectAll("rect").remove()
            this.labelText.selectAll("text").remove()
            this.verticalLine.selectAll("line").remove()
            this.eventName.selectAll("text").remove()
            this.secondEvent.selectAll("text").remove()
            
            
            this.svg
			.attr("height",options.viewport.height)                     //SVG height and width
            .attr("width",options.viewport.width)
           
		
			this.horizontalLine
			.attr("x1",20)
			.attr("y1",viewportHeight/1.5)                              //Horizontal line
			.attr("x2",viewportWidth-20)
            .attr("y2", viewportHeight / 1.5)
            .style("stroke",lineColor);

            this.labelBoxes.selectAll("rect")
            .data(totalElements)
            .enter()
                    .append("rect")
                    .attr("x",function(d,i){
                        if(i==0){
                            return 20;
                        }
                        else
                        {
                            return viewportWidth/4;
                        }
                    })
                    .attr("y",function(d,i){
                        return viewportHeight/10;
                    })
                    .attr("height",function(i){
                        if(viewportHeight<322){
                            return 0
                        }
                        else{
                            return 15;
                        }
                    })
                    .attr("width",15)
                    .style("fill",function(d,i){
                        return colors[i];
                    })
            
            this.labelText.selectAll("text")
                .data(totalElements)
                .enter()
                .append("text")
                .text(function(d,i){
                    return texts[i];
                    
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
                    if(viewportHeight<322){
                        return 0;
                    }
                    else{
                        return fontSize;
                    }
                })
                .style("fill","black")


          
         
          this.verticalLine.selectAll("line")
				.data(ratioArray)
				.enter()
					.append("line")                                     //Vertical lines
					.attr("x1",function(d,i){
						if(i==0){
							return initialOffset;                            
						}
						else{
							var x0=initialOffset;
							for(var j=1;j<=i;j++){
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
							for(var j=1;j<=i;j++){
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
                  
            this.eventName.selectAll("text")
                    .data(viewModel.dataPoints)
                    .enter()
                        .append("text")
                    .text(function (d, i) {
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
                                for(var j=1;j<=i;j++){
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
                        })//verticalLineHeight-35)
                        .attr("text-anchor","middle")
                        .attr("font-size",fontSize)
                        .style("fill", eventColors)
                        .style("background", "red")
                        .style("font-weight","bold")
                    

                      this.secondEvent.selectAll("text")
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
                                    for(var j=1;j<=i;j++){
                                         x0=x0+(ratioArray[j]*minPixels);
                                    }
                                    return x0;
                                }
                                
                            })
                            .attr("y",verticalLineHeight-5)
                            .attr("text-anchor","middle")
                            .attr("font-size",fontSize)
                            .style("fill", eventColors)
                            .style("background", "red")
                            .style("font-weight", "bold")
                            


                this.eventDate.selectAll("text")
                        .data(viewModel.dataPoints)
                        .enter()
                            .append("text")
                            .text(function(d,i){
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
                                    for(var j=1;j<=i;j++){
                                         x0=x0+(ratioArray[j]*minPixels);
                                    }
                                    return x0;
                                }
                                
                            })
                            .attr("y",(options.viewport.height/1.5)+25)
                            .attr("text-anchor","middle")
                            .attr("font-size", fontSize)//0.018 * options.viewport.width)
                        
                            .style("fill", dateColors)//"rgb(41, 130, 23)")


                        
               
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
            let objects = categories.objects;
            let highlights = values.highlights;

            for (let i = 0, len = Math.max(categories.values.length, values.values.length); i < len; i++) {
                viewModel.dataPoints.push({
                    event: <string>values.values[i],
                    timeStamp: <Date>categories.values[i],

                    color: objects && objects[i] && DataViewObjects.getFillColor(objects[i], {
                        objectName: "dataColors",
                        propertyName: "fill"
                    }, null) || this.host.colorPalette.getColor(<string>categories.values[i]).value,

                    identity: this.host.createSelectionIdBuilder()
                        .withCategory(categories, i)
                        .createSelectionId(),
                    highlighted: highlights ? highlights[i] ? true : false : false

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

                case "dataColors":
                    if (this.viewModel) {
                        for (let dp of this.viewModel.dataPoints) {
                            properties.push({
                                objectName: propertyGroupName,
                                displayName: dp.event,
                                properties: {
                                    fill: dp.color
                                },
                                selector: dp.identity.getSelector()
                            })
                        }
                    }
                    break;
            }
            return properties;
        }
    }
}