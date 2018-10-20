//(function init() {
(async function init() {
    'use strict';

    var margin = {top: 50, right: 40, bottom: 50, left: 40},
        chart1Width = 600,
        chart2Width = 600,
        chartHeight = 400;
	var textDisp = 30;
	var labelMargin = 10;
    var body = d3.select('body')

    var svg = d3.select('body').select('svg#main-plot')
        .attr('width', chart1Width + chart2Width + (margin.left + margin.right) * 2)
        .attr('height', (chartHeight * 2 ) + ((margin.top + margin.bottom)*2 ));

    var months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    var countries = ['Total','Estados Unidos','Canada','Paises Bajos','Aruba','Ecuador','Antillas Holandesas','Curazao','Panama','Japon','Mexico','Otros'];

    const DatasetBulbos = await d3.csv("./Bulbos.csv", parseInts);
    const datasetML = await d3.csv("./musgosliquenes.csv", parseInts);

    d3.csv('./plantasvivas.csv', parseInts).then(function (csv) {

        var chart1 = svg.append('g')
            .attr('id', 'montly-chart')
            .attr('class', 'chart')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('width', chart1Width)
            .attr('height', chartHeight);
        var chart2 = svg.append('g')
            .attr('id', 'annual-chart')
            .attr('class', 'chart')
            .attr('transform', 'translate(' + (chart1Width + margin.left * 2 + margin.right) + ',' + margin.top + ')')
            .attr('width', chart2Width)
            .attr('height', chartHeight);
        var chart3 = svg.append('g')
            .attr('id', 'country-chart')
            .attr('class', 'chart')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top + chartHeight) +')')
            .attr('width', chart1Width + chart2Width )
            .attr('height', chartHeight);

        //var monthScale = d3.scale.ordinal().domain(months).rangeBands([0, chart1Width], 0.1);
        var monthScale = d3.scaleBand().domain(months).rangeRound([0, chart1Width]).padding(0.1);
        var countryScale = d3.scaleBand().domain(countries).rangeRound([0, chart1Width + chart2Width + margin.left + margin.right ]).padding(0.1);
        var minYear = d3.min(csv, function(row) {return row['year']});
        var maxYear = d3.max(csv, function(row) {return row['year']});
        //var yearScale = d3.scale.linear().domain([minYear, maxYear]).range([0, chart2Width]);
        var yearScale = d3.scaleLinear().domain([minYear, maxYear]).range([0, chart2Width]);
        var minTon = d3.min(csv, function(row) {return row['prompv']});
		var minTonN = d3.min(csv, function(row) {return row['promb']});
		var minTonS = d3.min(csv, function(row) {return row['promml']});
		minTon = Math.min(minTon, minTonN, minTonS);
        var maxTon = d3.max(csv, function(row) {return row['prompv']});
        var maxTonN = d3.max(csv, function(row) {return row['promb']});
        var maxTonS = d3.max(csv, function(row) {return row['promml']});
		maxTon = Math.max(maxTon, maxTonN, maxTonS);
		var maxTonCon = d3.max(csv, function(row) {return row['Totpv']});
        var maxTonBCon = d3.max(csv, function(row) {return row['Totb']});
        var maxTonMLCon = d3.max(csv, function(row) {return row['Totml']});
		maxTonCon = Math.max(maxTonCon, maxTonBCon, maxTonMLCon);

		
        var tonScale = d3.scaleLinear().domain([minTon, maxTon + 650]).range([chartHeight, 0]);
        var tonScaleCon = d3.scaleLinear().domain([minTon, maxTonCon]).range([chartHeight, 0]);

		var maxAbsTon = Math.max(Math.abs(minTon), Math.abs(maxTon));		
			  
        var doubleFormatter = d3.format('.2f');
        var tonFormatter = function tonFormatter(d) {return doubleFormatter(d) + ' Ton';}
		//var xAxis1 = d3.svg.axis().scale(monthScale).orient('bottom').outerTickSize(0);
        var xAxis1 = d3.axisBottom(monthScale).tickSizeOuter(0);
		//var xAxis2 = d3.svg.axis().scale(yearScale).orient('bottom').outerTickSize(0).tickFormat(function (d) {return d;});
        var xAxis2 = d3.axisBottom(yearScale).tickSizeOuter(0).tickFormat(function (d) {return d;});
        var xAxis3 = d3.axisBottom(countryScale).tickSizeOuter(0);
		//var yAxisLeft1 = d3.svg.axis().scale(tonScale).orient('left').tickSize(0, 0).tickPadding(20).tickFormat(tonFormatter);
        var yAxisLeft1 = d3.axisLeft(tonScale).tickSize(0, 0).tickPadding(20).tickFormat(tonFormatter);
        var yAxisLeft1Con = d3.axisLeft(tonScaleCon).tickSize(0, 0).tickPadding(20).tickFormat(tonFormatter);
		//var yAxisRight1 = d3.svg.axis().scale(tonScale).orient('right').ticks(0).outerTickSize(0);
        var yAxisRight1 = d3.axisRight(tonScale).tickSizeOuter(0).ticks(0);
		//var yAxisEmpty = d3.svg.axis().scale(tonScale).orient('right').ticks(0).outerTickSize(0);
        var yAxisEmpty = d3.axisRight(tonScale).tickSizeOuter(0).ticks(0);

        chart1.append('g').attr('class', 'axis x-axis month-axis').attr('transform', 'translate(0, ' + chartHeight + ')').call(xAxis1);
        chart1.append('g').attr('class', 'axis y-axis ton-axis').call(yAxisEmpty);
        chart1.append('g').attr('class', 'axis y-axis ton-axis').attr('transform', 'translate(' + chart1Width + ', 0)').call(yAxisRight1);

        chart2.append('g').attr('class', 'axis x-axis year-axis').attr('transform', 'translate(0, ' + chartHeight + ')').call(xAxis2);
        chart2.append('g').attr('class', 'axis y-axis ton-axis').call(yAxisLeft1);
        chart2.append('g').attr('class', 'axis y-axis ton-axis').attr('transform', 'translate(' + chart2Width + ', 0)').call(yAxisEmpty);

        chart3.append('g').attr('class', 'axis x-axis month-axis').attr('transform', 'translate(0, ' + (margin.top + chartHeight) + ')').call(xAxis3);
        chart3.append('g').attr('class', 'axis y-axis ton-axis').attr('transform', 'translate(0 , ' + margin.top + ' )').call(yAxisLeft1Con);
        chart3.append('g').attr('class', 'axis y-axis ton-axis').attr('transform', 'translate(' + (chart1Width + chart2Width + (margin.left + margin.right)) + ' , ' + margin.top + ' )').call(yAxisEmpty);

        var avgLine = chart1.append('svg:line').attr('class', 'line').attr('id', 'avg-line');
        var avgLineML = chart1.append('svg:line').attr('class', 'line').attr('id', 'avg-lineML');
        var avgLineB = chart1.append('svg:line').attr('class', 'line').attr('id', 'avg-lineB');
        var sweepLine = chart2.append('svg:line').attr('class', 'line').attr('id', 'sweep-line');
        
        var line2 = d3.line()
                .x(function(d) {console.log(yearScale(+d['year']));return yearScale(+d['year']);})
                .y(function(d) {console.log(tonScale(+d['prompv']));return tonScale(+d['prompv']);})
                .curve(d3.curveMonotoneX);
                //.interpolate('monotone');  ----->  .curve(d3.curveMonotoneX) Version5
        var graph2 = chart2.append('path').attr('class', 'line graph').data(csv)
                    .attr('d', line2(csv));

        var lineML = d3.line()
                .x(function(d) {return yearScale(+d['year']);})
                .y(function(d) {return tonScale(+d['promml']);});
        var graphML = chart2.append('path').attr('class', 'line graphML').attr('id','linegraphS').data(csv)
                    .attr('d', lineML(csv));
        
	
        var lineBulb = d3.line()            
                .x(function(d) {return yearScale(+d['year']);})
                .y(function(d) {return tonScale(+d['promb']);});
        var graphBulb = chart2.append('path').attr('class', 'line graphBulb').attr('id','linegraphN').data(csv)
                    .attr('d', lineBulb(csv));


        var tonLabel = chart2.append('svg:text').attr('class', 'label').attr('id', 'ton-label');
        var tonLabelS = chart2.append('svg:text').attr('class', 'label').attr('id', 'ton-labelS');
        var tonLabelN = chart2.append('svg:text').attr('class', 'label').attr('id', 'ton-labelN');
        var yearLabel = chart2.append('svg:text').attr('class', 'label').attr('id', 'year-label');
        var yearLabelCon = chart3.append('svg:text').attr('class', 'label').attr('id', 'year-label');
        var yearLabelMon = chart1.append('svg:text').attr('class', 'label').attr('id', 'year-label');

        var TonAxisLabel1 = chart1.append('svg:text').attr('class', 'axis-legend')
            .attr('transform', 'translate(' + (-margin.left / 2) + ',' + (chartHeight / 2) + ')rotate(-90)')
            .text('Total de exportación en Toneladas por mes.');

        var TonAxisLabel1 = chart2.append('svg:text').attr('class', 'axis-legend')
            .attr('transform', 'translate(' + (chart2Width + margin.right / 2) + ',' + (chartHeight / 2) + ')rotate(90)')
            .text('Promedio anual de exportaciones dados en Toneladas');

  		var TonAxisLabel1 = chart3.append('svg:text').attr('class', 'axis-legend')
            .attr('transform', 'translate(' + (chart1Width + chart2Width + margin.right + margin.left + (labelMargin*2) ) + ',' + ((chartHeight/2) + (labelMargin*2)) + ')rotate(90)')
            .text('Total de exportación en toneladas en el año y por país.');


        svg.on('mousemove', function() {
            var year = Math.round(yearScale.invert(d3.event.offsetX - (chart1Width + margin.left * 2 + margin.right)));
            showYear(Math.min(Math.max(0, year - csv[0]['year']), csv.length - 1));
        });

        showYear(32); /*llamado función indicando numero de columnas*/

        async function showYear(index) {
            var animationDuration = 100;
            var easingEffect = 'linear';
            var mainColor = 0;
            var yearSeparator = 2013;
            var labelMargin = 10;

            var yearData = csv[index];
            var year = yearData['year'];
            var globalTon = yearData['prompv'];
			//console.log(tonScale(globalTon));
            var globalTonML = yearData['promml'];
            var globalTonBulb = yearData['promb'];



			var t = chart1.selectAll('rect').data(months);
            t.enter().append('svg:rect');
            t.transition()
				.attr('x', function(d){return monthScale(d);})
                .attr('y', function(d){return Math.min(tonScale(0), tonScale(yearData[d]));})
                .attr('width', monthScale.bandwidth()/3)
				.attr('height', function(d) {return Math.abs(Math.round(tonScale(0) - tonScale(yearData[d])));})
				.style('fill', 'orange')
				.duration(animationDuration)
                .ease(d3.easeElastic);


            var tN = chart1.selectAll('rect#N').data(months);
            tN.enter().append('svg:rect').attr('id','N').attr('opacity','0.9');
            tN.transition()
				.attr('x', function(d){return monthScale(d)+(monthScale.bandwidth()/3);})
                .attr('y', function(d) {return Math.min(tonScale(0), tonScale(DatasetBulbos[index][d]));})
				.attr('width', monthScale.bandwidth()/3)
                .attr('height', function(d) {console.log(Math.abs(tonScale(0) - tonScale(DatasetBulbos[index][d])));return Math.abs(tonScale(0) - tonScale(DatasetBulbos[index][d]));})
				.duration(animationDuration)
				//.ease(easingEffect);
                .ease(d3.easeElastic);
            
			var tS = chart1.selectAll('rect#S').data(months);
            tS.enter().append('svg:rect').attr('id','S').attr('opacity','0.9');
            tS.transition()
              	.attr('x', function(d){return monthScale(d)+((monthScale.bandwidth()/3)*2);})
                .attr('y', function(d) {return Math.min(tonScale(0), tonScale(datasetML[index][d]));})
                .attr('width', monthScale.bandwidth()/3)
                .attr('height', function(d) {return Math.abs(tonScale(0) - tonScale(datasetML[index][d]));})
				.duration(animationDuration)
				//.ease(easingEffect);
                .ease(d3.easeElastic);
                //tS.exit().remove();


            var labeltpv = chart1.selectAll('text.tpv').data(months);
            labeltpv.enter().append('svg:text').attr('class', 'tpv');
            labeltpv.transition()
                .text(function(d){return (yearData[year,d]);})
                .style('stroke', "orange")
                .attr('x', function(d){return monthScale(d);})
                .attr('y', function(d) {return tonScale(yearData[d])-5;})
                .attr('text-anchor', 'left')
                .duration(animationDuration)
				//.ease(easingEffect);
                .ease(d3.easeElastic);

	        var labeltml = chart1.selectAll('text.tml').data(months);
            labeltml.enter().append('svg:text').attr('class', 'tml');
            labeltml.transition()
                .text(function(d){return (datasetML[index][d]);})
                .style('stroke', "green")
                .attr('x', function(d){return monthScale(d) + (margin.left/2) ;})
                .attr('y', function(d) {return tonScale(datasetML[index][d])-5;})
                .attr('text-anchor', 'right')
                .duration(animationDuration)
				//.ease(easingEffect);
                .ease(d3.easeElastic);


            var labeltb = chart1.selectAll('text.tbulb').data(months);
            labeltb.enter().append('svg:text').attr('class', 'tbulb');
            labeltb.transition()
                .text(function(d){return (DatasetBulbos[index][d]);})
                .style('stroke', "purple")
                .attr('x', function(d){return monthScale(d) + (margin.left/2) ;})
                .attr('y', function(d) {return tonScale(DatasetBulbos[index][d]);})
                .attr('text-anchor', 'center')
                .duration(animationDuration)
				//.ease(easingEffect);
                .ease(d3.easeElastic);

            yearLabelMon.transition()
                .text(year)
                .attr('x', chart1Width/2)
                .attr('y', margin.top)
                .attr('text-anchor', 'middle')
                .duration(animationDuration)
                .ease(d3.easeElastic);


                var tpvCont = chart3.selectAll('rect').data(countries);
            	tpvCont.enter().append('svg:rect');
            	tpvCont.transition()
				.attr('x', function(d){return countryScale(d);})
                .attr('y', function(d){return Math.min(tonScaleCon(0), tonScaleCon(yearData[d])) + margin.top ;})
                .attr('width', countryScale.bandwidth()/3)
                .attr('height', function(d) {return Math.abs(Math.round(tonScaleCon(0) - tonScaleCon(yearData[d])));})
				.style('fill', 'orange')
				.duration(animationDuration)
                .ease(d3.easeElastic);
        
        	    var tbCont = chart3.selectAll('rect#N').data(countries);
         	   	tbCont.enter().append('svg:rect').attr('id','N').attr('opacity','0.9');
         	   	tbCont.transition()
				.attr('x', function(d){return countryScale(d)+(countryScale.bandwidth()/3);})
                .attr('y', function(d) {return Math.min(tonScaleCon(0), tonScaleCon(DatasetBulbos[index][d])) + margin.top ;})
				.attr('width',countryScale.bandwidth()/3)
                .attr('height', function(d) {console.log(Math.abs(tonScaleCon(0) - tonScaleCon(DatasetBulbos[index][d])));return Math.abs(tonScaleCon(0) - tonScaleCon(DatasetBulbos[index][d]));})
				.duration(animationDuration)
                .ease(d3.easeElastic);


                var tmlCont = chart3.selectAll('rect#S').data(countries);
            	tmlCont.enter().append('svg:rect').attr('id','S').attr('opacity','0.9');
            	tmlCont.transition()
              	.attr('x', function(d){return countryScale(d)+((countryScale.bandwidth()/3)*2);})
                .attr('y', function(d) {return Math.min(tonScaleCon(0), tonScaleCon(datasetML[index][d])) + margin.top  ;}) 
                .attr('width', countryScale.bandwidth()/3)
                .attr('height', function(d) {return Math.abs(tonScaleCon(0) - tonScaleCon(datasetML[index][d]));})
				.duration(animationDuration)
			    .ease(d3.easeElastic);
                //tS.exit().remove();


            var labeltpvC = chart3.selectAll('text.tpvC').data(countries);
            labeltpvC.enter().append('svg:text').attr('class', 'tpvC');
            labeltpvC.transition()
                .text(function(d){return (yearData[year,d]);})
                .style('stroke', "orange")
                .attr('x', function(d){return countryScale(d);})
                .attr('y', function(d) {return tonScaleCon(yearData[d]) + margin.top -5;})
                .attr('text-anchor', 'middle')
                .duration(animationDuration)
                .ease(d3.easeElastic);

	        var labeltmlC = chart3.selectAll('text.tmlC').data(countries);
            labeltmlC.enter().append('svg:text').attr('class', 'tmlC');
            labeltmlC.transition()
                .text(function(d){return (datasetML[index][d]);})
                .style('stroke', "green")
                .attr('x', function(d){return countryScale(d)  + (margin.left*2) ;})
                .attr('y', function(d) {return tonScaleCon(datasetML[index][d]) + margin.top -5;})
                .attr('text-anchor', 'middle')
                .duration(animationDuration)
                .ease(d3.easeElastic);


            var labeltbC = chart3.selectAll('text.tbulbC').data(countries);
            labeltbC.enter().append('svg:text').attr('class', 'tbulbC');
            labeltbC.transition()
                .text(function(d){return (DatasetBulbos[index][d]);})
                .style('stroke', "purple")
                .attr('x', function(d){return countryScale(d) + (margin.left + (labelMargin/2)) ;})
                .attr('y', function(d) {return tonScaleCon(DatasetBulbos[index][d]) + margin.top;})
                .attr('text-anchor', 'middle')
                .duration(animationDuration)
                .ease(d3.easeElastic);

            yearLabelCon.transition()
                .text(year)
                .attr('x', chart1Width)
                .attr('y', chartHeight/2)
                .attr('text-anchor', 'middle')
                .duration(animationDuration)
                .ease(d3.easeElastic);


            tonLabel.transition()
                .text("Plantas Vivas: " + tonFormatter(globalTon))
                .attr('x', year < yearSeparator ? yearScale.range()[1] - labelMargin : yearScale.range()[0] + labelMargin)
                .attr('y', tonScale(globalTonML) - labelMargin)
                .attr('fill', 'orange')
                .attr('text-anchor', year < yearSeparator ? 'end' : 'start')
                .duration(animationDuration)
				//.ease(easingEffect);
                .ease(d3.easeElastic);

			tonLabelS.transition()
                .text("Musgo Liquen:" + tonFormatter(globalTonML))
                .attr('x', year < yearSeparator ? yearScale.range()[1] - labelMargin : yearScale.range()[0] + labelMargin)
                .attr('y', tonScale(globalTonML) - labelMargin - textDisp)
                .attr('fill', 'green')
                .attr('text-anchor', year < yearSeparator ? 'end' : 'start')
                .duration(animationDuration)
				//.ease(easingEffect);
                .ease(d3.easeElastic);

			tonLabelN.transition()
                .text("Bulbos: " + tonFormatter(globalTonBulb))
                .attr('x', year < yearSeparator ? yearScale.range()[1] - labelMargin : yearScale.range()[0] + labelMargin)
                .attr('y', tonScale(globalTonML) - labelMargin + textDisp)
                .attr('fill', 'purple')
                .attr('text-anchor', year < yearSeparator ? 'end' : 'start')
                .duration(animationDuration)
				//.ease(easingEffect)
                .ease(d3.easeElastic);

            yearLabel.transition()
                .text(year)
                .attr('x', yearScale(year) + (year < yearSeparator ? labelMargin : - labelMargin))
                .attr('y', labelMargin)
                .attr('text-anchor', year < yearSeparator ? 'start' : 'end')
                .duration(animationDuration)
				//.ease(easingEffect);
                .ease(d3.easeElastic);

            sweepLine.transition()
                    .attr('x1', yearScale(year))
                    .attr('y1', tonScale.range()[1])
                    .attr('x2', yearScale(year))
                    .attr('y2', tonScale.range()[0])
                    .duration(animationDuration)
                  //  .delay(animationDuration)
                  //  .ease(easingEffect)
                    .ease(d3.easeElastic);

            avgLine.transition()
                    .attr('x1',monthScale.bandwidth()[0])
                    .attr('y1',tonScale(globalTon))
                    .attr('x2', svg.attr('width'))
                    .attr('y2',tonScale(globalTon))
                    .style('Stroke-dasharray','5 5')
                    .duration(animationDuration)
					//.ease(easingEffect)
                    .ease(d3.easeElastic)


            avgLineB.transition()
                    .attr('x1',monthScale.bandwidth()[0])
                    .attr('y1',tonScale(globalTonBulb))
                    .attr('x2', svg.attr('width'))
                    .attr('y2',tonScale(globalTonBulb))
                    .attr('stroke', "purple")
                    .style('Stroke-dasharray','5 5')
                    .duration(animationDuration)
					//.ease(easingEffect)
                    .ease(d3.easeElastic)

            avgLineML.transition()
                    .attr('x1',monthScale.bandwidth()[0])
                    .attr('y1',tonScale(globalTonML))
                    .attr('x2', svg.attr('width'))
                    .attr('y2',tonScale(globalTonML))
                    .attr('stroke', "green")
                    .style('Stroke-dasharray','5 5')
                    .duration(animationDuration)
					//.ease(easingEffect)
                    .ease(d3.easeElastic)
                    .exit()
                    .remove();

 
        } /*fin function showyear*/
    });  /*fin d3.csv*/

    function parseInts(row) {
        for (var key in row) {
            if (row.hasOwnProperty(key)) {
                row[key] = +row[key];
                 }
            }
        return row;
        } /*fin function parseInts*/
})
(); /*fin function init, autocall*/