// dimensions
var svg = d3.select("svg#grafico"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
//scales
var color = d3.scaleOrdinal(d3.schemeCategory10);
var ratio = d3.scaleSqrt().domain([1, 52]).range([5, 30]);
const forceX = d3.forceX(width / 2).strength(0.15)
const forceY = d3.forceY(height / 2).strength(0.15)
//create a simulation
var simulation = d3.forceSimulation()
   // .force("center", d3.forceCenter(width / 2, height / 2))
    .force('x', forceX)
    .force('y',  forceY)
    .force("link", d3.forceLink().id(function(d) { return d.id; }).strength(1.8).distance(10))
    .force("collide", d3.forceCollide().radius( function(d) { return ratio(d.total_items); }).strength(2))
    .force("charge", d3.forceManyBody().strength(-40))
    ;
    
// load the graph
d3.json("proyectos2.json").then(function(graph) {
      // add the line links to our graphic
  var thelink = svg.selectAll(".links")
    .data(graph.edges)
    .enter()
    .append("g")
	.attr("class", "links");

   var link =  thelink.append("line")
   			.attr("stroke-width","1");

   var textlink = thelink.append("text")
        .attr("class", "label-link")
        .text( "" )
        .style("stroke", "black")
        .style("stroke-width", 0.5)
        .style("fill", "black")
        .style("pointer-events", "none");

    // add the nodes to the graphic
  var node = svg.selectAll(".nodes")
    .data(graph.nodes)
    .enter().append('g');

    // add a circle to represent the node
    node.append("circle")
      .attr("class", "nodes")
      .attr("r", function(d) { return ratio(d.total_items); })
      .attr("fill", function(d) { return color(d.tiponodo); })
      .on("mouseover", mouseOver(.2))
      .on("mouseout", mouseOut)
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    // add a label to each Region node
      node.append("text")
        .attr("class", "labelnode")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text( "")
        .style("stroke", "black")
        .style("stroke-width", 0.5)
        .style("pointer-events", "none")
        .style("fill", function(d) {
            return  color(d.tiponodo);
        });
    // hover text for the node
  node.append("title")
     .text(function(d) {if (d.tiponodo == "proyecto" ){return d.nodo + "\r Total de autores " + d.total_items;} 
            else {return d.nodo + "\r Total de proyectos presentados " + d.total_items;} });
      
    // add the nodes to the simulation and
    // tell it what to do on each tick
  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);
    // add the links to the simulation
  simulation
      .force("link")
      .links(graph.edges);
    // on each tick, update node and link positions
  function ticked() {
  	textlink
  	  .attr("x", function(d) { return d.target.x; })
      .attr("y", function(d) { return d.target.y; })
      .attr('text-anchor', 'middle')
      .attr("dx", 50)
      .attr("dy", ".35em");
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
  } //end ticked function

    // build a dictionary of nodes that are linked
    var linkedByIndex = {};
    graph.edges.forEach( function(d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });
// check the dictionary to see if nodes are linked
    function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }
 // fade nodes on hover
    function mouseOver(opacity) {
        return function(d) {
            // check all other nodes to see if they're connected
            // to this one. if so, keep the opacity at 1, otherwise
            // fade
            node.style("stroke-opacity", function(o) {
                thisOpacity = isConnected(d, o) ? 1 : opacity;
                return thisOpacity;
            });
            node.style("fill-opacity", function(o) {
                thisOpacity = isConnected(d, o) ? 1 : opacity;
                return thisOpacity;
            });
            // also style link accordingly
            link.style("stroke-opacity", function(o) {
                return o.source === d || o.target === d ? 1 : opacity;
            });
            link.style("stroke", function(o){
                return o.source === d || o.target === d ? o.source.colour : "#ddd";
            });
              svg.selectAll(".labelnode").text(function(o) {
                thistext = isConnected(d, o) ? o.nodo : "";
                return thistext} );
              // textlink.text( function(o) {
              //   thisl = isConnected(d, o) ? o.total_items : "";
              //   return thisl;          });
        };
    }
// return opacity nodes on mouse out
    function mouseOut() {
        node.style("stroke-opacity", 1);
        node.style("fill-opacity", 1);
        link.style("stroke-opacity", 1);
        link.style("stroke", "#ddd");
        svg.selectAll(".label-link").text("");
        svg.selectAll(".labelnode").text( "")
        ;
    }

}); //end D3 json

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}//end dragstarted function

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}//end dragged function

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}//end dragended function