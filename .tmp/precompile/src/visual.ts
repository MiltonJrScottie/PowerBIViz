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

        public update(options: VisualUpdateOptions) {

            let viewModel = this.getViewModel(options);

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
                    event: <string>categories.values[i],
                    timeStamp: <Date>values.values[i]
                });
            }

            viewModel.maxTimeStamp = d3.max(viewModel.dataPoints, d => d.timeStamp);

            return viewModel;
        }
    }
}