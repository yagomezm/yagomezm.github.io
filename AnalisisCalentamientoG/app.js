(function init() {
    'use strict';

    var margin = {top: 50, right: 40, bottom: 50, left: 40},
        chart1Width = 300,
        chart2Width = 700,
        chartHeight = 400;
	var textDisp = 30;
    var body = d3.select('body')

    var svg = d3.select('body').select('svg#main-plot')
        .attr('width', chart1Width + chart2Width + (margin.left + margin.right) * 2)
        .attr('height', chartHeight + margin.top + margin.bottom);

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var datasetN;
    var datasetS;

    d3.csv('./HNorte.csv', parseInts, function (csvN) {datasetN = csvN;});
    setTimeout(function(){console.log(datasetN);},200);

    d3.csv('./HSUR.csv', parseInts, function (csvS) {datasetS = csvS;});
    setTimeout(function(){console.log(datasetS);},200);

    d3.csv('./data.csv', parseInts, function (csv) {
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

        var monthScale = d3.scale.ordinal().domain(months).rangeBands([0, chart1Width], 0.1);
        var minYear = d3.min(csv, function(row) {return row['Year']});
        var maxYear = d3.max(csv, function(row) {return row['Year']});
        var yearScale = d3.scale.linear().domain([minYear, maxYear]).range([0, chart2Width]);
        var minTemp = d3.min(csv, function(row) {return row['Glob']});
		var minTempN = d3.min(csv, function(row) {return row['NHem']});
		var minTempS = d3.min(csv, function(row) {return row['SHem']});
		minTemp = Math.min(minTemp, minTempN, minTempS);
        var maxTemp = d3.max(csv, function(row) {return row['Glob']});
        var maxTempN = d3.max(csv, function(row) {return row['NHem']});
        var maxTempS = d3.max(csv, function(row) {return row['SHem']});
		maxTemp = Math.max(maxTemp, maxTempN, maxTempS);
		
        var tempScale = d3.scale.linear().domain([minTemp - 30, maxTemp + 20]).range([chartHeight, 0]);
        var colorScale = d3.scale.linear().domain([minTemp, maxTemp]).range([0, 195]);
		var maxAbsTemp = Math.max(Math.abs(minTemp), Math.abs(maxTemp));		
        var colorScale2 = d3.scale.linear().domain([-maxAbsTemp, maxAbsTemp]).range([0.85, -0.05]);
	  
        var doubleFormatter = d3.format('.2f');
        var tempFormatter = function tempFormatter(d) {return doubleFormatter(d / 100) + ' \u00B0C';}
        var xAxis1 = d3.svg.axis().scale(monthScale).orient('bottom').outerTickSize(0);
        var xAxis2 = d3.svg.axis().scale(yearScale).orient('bottom').outerTickSize(0).tickFormat(function (d) {return d;});
        var yAxisLeft1 = d3.svg.axis().scale(tempScale).orient('left').tickSize(0, 0).tickPadding(20).tickFormat(tempFormatter);
        var yAxisRight1 = d3.svg.axis().scale(tempScale).orient('right').ticks(0).outerTickSize(0);
        var yAxisEmpty = d3.svg.axis().scale(tempScale).orient('right').ticks(0).outerTickSize(0);

        chart1.append('g').attr('class', 'axis x-axis month-axis').attr('transform', 'translate(0, ' + chartHeight + ')').call(xAxis1);
        chart1.append('g').attr('class', 'axis y-axis temp-axis').call(yAxisEmpty);
        chart1.append('g').attr('class', 'axis y-axis temp-axis').attr('transform', 'translate(' + chart1Width + ', 0)').call(yAxisRight1);

        chart2.append('g').attr('class', 'axis x-axis year-axis').attr('transform', 'translate(0, ' + chartHeight + ')').call(xAxis2);
        chart2.append('g').attr('class', 'axis y-axis temp-axis').call(yAxisLeft1);
        chart2.append('g').attr('class', 'axis y-axis temp-axis').attr('transform', 'translate(' + chart2Width + ', 0)').call(yAxisEmpty);

        var avgLine = chart1.append('svg:line').attr('class', 'line').attr('id', 'avg-line');
        var graph2 = chart2.append('svg:path').attr('class', 'line graph');
        var graphSH = chart2.append('svg:path').attr('class', 'line graphSH').attr('id','linegraphS');
        var graphNH = chart2.append('svg:path').attr('class', 'line graphNH').attr('id','linegraphN');
		
        var sweepLine = chart2.append('svg:line').attr('class', 'line').attr('id', 'sweep-line');
        var tempLabel = chart2.append('svg:text').attr('class', 'label').attr('id', 'temp-label');
        var tempLabelS = chart2.append('svg:text').attr('class', 'label').attr('id', 'temp-labelS');
        var tempLabelN = chart2.append('svg:text').attr('class', 'label').attr('id', 'temp-labelN');
        var yearLabel = chart2.append('svg:text').attr('class', 'label').attr('id', 'year-label');
        var tempAxisLabel1 = chart1.append('svg:text').attr('class', 'axis-legend')
            .attr('transform', 'translate(' + (-margin.left / 2) + ',' + (chartHeight / 2) + ')rotate(-90)')
            .text('Delta de temperatura promedio Global en \u00B0C por mes.');
        var tempAxisLabel1 = chart2.append('svg:text').attr('class', 'axis-legend')
            .attr('transform', 'translate(' + (chart2Width + margin.right / 2) + ',' + (chartHeight / 2) + ')rotate(90)')
            .text('Promedio anual del delta de temperatura en \u00B0C');

        graph2.attr('d', function() {
            return d3.svg.line()
                .x(function(d) {return yearScale(+d['Year']);})
                .y(function(d) {return tempScale(+d['Glob']);})
                .interpolate('monotone')(csv);
        });

        graphSH.attr('d', function() {
            return d3.svg.line()
                .x(function(d) {return yearScale(+d['Year']);})
                .y(function(d) {return tempScale(+d['SHem']);})
                .interpolate('monotone')(csv);
        });
        graphNH.attr('d', function() {
            return d3.svg.line()
                .x(function(d) {return yearScale(+d['Year']);})
                .y(function(d) {return tempScale(+d['NHem']);})
                .interpolate('monotone')(csv);
        });

        svg.on('mousemove', function() {
            var year = Math.round(yearScale.invert(d3.event.offsetX - (chart1Width + margin.left * 2 + margin.right)));
            showYear(Math.min(Math.max(0, year - csv[0]['Year']), csv.length - 1));
        });

        showYear(32); /*llamado función indicando numero de columnas*/

        function showYear(index) {
            var animationDuration = 100;
            var easingEffect = 'linear';
            var mainColor = 0;
            var yearSeparator = 1970;
            var labelMargin = 10;

            var yearData = csv[index];
            var year = yearData['Year'];
            var globalTemp = yearData['Glob'];
            var globalTempSH = yearData['SHem'];
            var globalTempNH = yearData['NHem'];
            var c = colorScale(globalTemp);
            var color = d3.hsl(c >= 0 ? mainColor : mainColor + 180, Math.abs(c), 0.6);
	  
            graph2.transition()
                .attr('stroke', color)
                .duration(animationDuration)
                .ease(easingEffect);
			graphSH.transition()
                .attr('stroke', color)
                .duration(animationDuration)
                .ease(easingEffect);
			graphNH.transition()
                .attr('stroke', color)
                .duration(animationDuration)
                .ease(easingEffect);
			var t = chart1.selectAll('rect').data(months);
            t.enter().append('svg:rect');
            t.transition()
				.attr('x', function(d){return monthScale(d);})
                .attr('y', function(d) {return Math.min(tempScale(0), tempScale(yearData[d]));})
                .attr('width', monthScale.rangeBand())
                .attr('height', function(d) {return Math.abs(tempScale(0) - tempScale(yearData[d]));})
				.style('fill', function(d) {return d3.interpolateRdBu(colorScale2(yearData[d]));})
				.duration(animationDuration)
                .ease(easingEffect);
            t.exit().remove();
            var tN = chart1.selectAll('rect#N').data(months);
            tN.enter().append('svg:rect').attr('id','N').attr('opacity','0.15');
            tN.transition()
				.attr('x', function(d){return monthScale(d);})
                .attr('y', function(d) {return Math.min(tempScale(0), tempScale(datasetN[index][d]));})
                .attr('width', monthScale.rangeBand()/3)
                .attr('height', function(d) {return Math.abs(tempScale(0) - tempScale(datasetN[index][d]));})
				.duration(animationDuration)
                .ease(easingEffect);
            tN.exit().remove();
			var tS = chart1.selectAll('rect#S').data(months);
            tS.enter().append('svg:rect').attr('id','S').attr('opacity','0.15');
            tS.transition()
				.attr('x', function(d){return monthScale(d)+(monthScale.rangeBand()/2);})
                .attr('y', function(d) {return Math.min(tempScale(0), tempScale(datasetS[index][d]));})
                .attr('width', monthScale.rangeBand()/3)
                .attr('height', function(d) {return Math.abs(tempScale(0) - tempScale(datasetS[index][d]));})
				.duration(animationDuration)
                .ease(easingEffect);
            tS.exit().remove();
			/* Line 0 Chart1 */
            var lineData = [];
			lineData.push([0, tempScale(0)]);
			lineData.push([chart1Width, tempScale(0)]);
			
            var lineFunction = d3.svg.line()
                         .x(function(d) { return d[0]; })
                         .y(function(d) { return d[1]; })
                         .interpolate("basis");
						 
            var line0 = chart1.append('path')
                            .attr("d", lineFunction(lineData))
                            .attr("stroke", "black")
                            .attr("stroke-width", 1)
                            .attr("fill", "none");
			
            var labelt = chart1.selectAll('text.lt').data(months);
            labelt.enter().append('svg:text').attr('class', 'lt');
            labelt.transition()
                .text(function(d){return (yearData[year,d])/100;})
                .attr('fill', "black")
                .attr('x', function(d){return monthScale(d);})
                .attr('y', function(d) {return tempScale(yearData[d])-5;})
                .attr('text-anchor', 'left')
                .duration(animationDuration)
                .ease(easingEffect);
            labelt.exit().remove();

            avgLine.transition()
                .attr({
                    x1: monthScale.range()[0],
                    y1: tempScale(globalTemp),
                    x2: svg.attr('width'),
                    y2: tempScale(globalTemp)
                     })
                .duration(animationDuration)
                .ease(easingEffect);
            sweepLine.transition()
                .attr({
                    x1: yearScale(year),
                    y1: tempScale.range()[0],
                    x2: yearScale(year),
                    y2: tempScale.range()[1]
                    })
                .duration(animationDuration)
                .ease(easingEffect);
            tempLabel.transition()
                .text("G: " + tempFormatter(globalTemp))
                .attr('x', year < yearSeparator ? yearScale.range()[1] - labelMargin : yearScale.range()[0] + labelMargin)
                .attr('y', tempScale(globalTemp) - labelMargin)
                .attr('fill', color)
                .attr('text-anchor', year < yearSeparator ? 'end' : 'start')
                .duration(animationDuration)
                .ease(easingEffect);

			tempLabelS.transition()
                .text("SH:" + tempFormatter(globalTempSH))
                .attr('x', year < yearSeparator ? yearScale.range()[1] - labelMargin : yearScale.range()[0] + labelMargin)
                .attr('y', tempScale(globalTemp) - labelMargin + textDisp)
                .attr('fill', color)
                .attr('text-anchor', year < yearSeparator ? 'end' : 'start')
                .duration(animationDuration)
                .ease(easingEffect);

			tempLabelN.transition()
                .text("NH: " + tempFormatter(globalTempNH))
                .attr('x', year < yearSeparator ? yearScale.range()[1] - labelMargin : yearScale.range()[0] + labelMargin)
                .attr('y', tempScale(globalTemp) - labelMargin - textDisp)
                .attr('fill', color)
                .attr('text-anchor', year < yearSeparator ? 'end' : 'start')
                .duration(animationDuration)
                .ease(easingEffect);

            yearLabel.transition()
                .text(year)
                .attr('x', yearScale(year) + (year < yearSeparator ? labelMargin : - labelMargin))
                .attr('y', tempScale.range()[0] - labelMargin)
                .attr('text-anchor', year < yearSeparator ? 'start' : 'end')
                .duration(animationDuration)
                .ease(easingEffect);
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
})(); /*fin function init, autocall*/