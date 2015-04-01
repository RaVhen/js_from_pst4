
// Var declaration
var w = window.innerWidth;
var h = window.innerHeight;

var keyc = true, keys = true, keyt = true, keyr = true, keyx = true, keyd = true, keyl = true, keym = true, keyh = true, key1 = true, key2 = true, key3 = true, key0 = true

var focus_node = null, highlight_node = null;

var text_center = false;
var outline = false;

var min_score = 0;
var max_score = 1;

var color = d3.scale.linear()
  .domain([min_score, (min_score+max_score)/2, max_score])
  .range(["lime", "yellow", "red"]);

var highlight_color = "black";
var highlight_trans = 0.1;
  
var size = d3.scale.pow().exponent(1)
  .domain([1,100])
  .range([8,24]);
    
var force = d3.layout.force()
  .linkDistance(60)
  .charge(-300)
  .size([w,h]);

var default_node_color = "#e45";
var default_link_color = "#888";
var nominal_base_node_size = 8;
var nominal_text_size = 10;
var max_text_size = 24;
var nominal_stroke = 1.5;
var max_stroke = 4.5;
var max_base_node_size = 36;
var min_zoom = 0.1;
var max_zoom = 7;
var svg = d3.select("body").append("svg");
var zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom])
var g = svg.append("g");

svg.style("cursor","default");

d3.json("graph2.json", function(error, graph) {

    // Used to link node by id instead of default index
    var edges = [];
        graph.links.forEach(function(e) { 
        var sourceNode = graph.nodes.filter(function(n) { return n.id === e.source; })[0],
        targetNode = graph.nodes.filter(function(n) { return n.id === e.target; })[0];
        

        if (sourceNode && targetNode)
            edges.push({source: sourceNode, target: targetNode, value: e.value});
        else
            console.error("skipped link");
    });


    // TO DO
    var linkedByIndex = {};
        graph.links.forEach(function(d) {
        linkedByIndex[d.source + "," + d.target] = true;
    });

    // return state of a and b
    function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }

    // return neighbour of a
    function hasConnections(a) {
        for (var property in linkedByIndex) {
                s = property.split(",");
                if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property]) return true;
        }
    return false;
    }
    
    // Start forces on graph
    force
        .nodes(graph.nodes)
        .links(edges)
        .start();

    // Links part
    var link = g.selectAll(".link")
        .data(edges)
        .enter().append("line")
            .attr("class", "link")
        .style("stroke-width",nominal_stroke)
        .style("stroke", default_link_color)

    // Nodes part
    var node = g.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
            .attr("class", "node")
            .call(force.drag)
    console.error(graph.nodes.length)

    // Open url in another tab
    node.on("dblclick", function(d){
        url = d.url
        window.open(url,'_target');
    });
    


    // Colors for nodes    
    var tocolor = "fill";
    var towhite = "stroke";
    if (outline) {
        tocolor = "stroke"
        towhite = "fill"
    }
        
    node.append("image")
      .attr("xlink:href", function(d) { return d.icon; })
      .attr("x", "-12px")
      .attr("y", "-12px")
      .attr("width", "24px")
      .attr("height", "24px");


    node.append("title")
      .text(function(d) { return d.name; });
    // Nodes - probably wont use
    /*var circle = node.append("path")
            .attr("d", d3.svg.symbol()
        .size(function(d) { return Math.PI*Math.pow(size(d.size)||nominal_base_node_size,2); })
        .type(function(d) { return d.type; }))
        .style(tocolor,default_node_color)
        //.attr("r", function(d) { return size(d.size)||nominal_base_node_size; })
        .style("stroke-width", nominal_stroke)
        .style(towhite, "white");*/
    
    // Text for nodes - Necessary ?            
    /*var text = g.selectAll(".text")
        .data(graph.nodes)
        .enter().append("text")
        .attr("dy", ".35em")
        .style("font-size", nominal_text_size + "px")

        if (text_center)
         text.text(function(d) { return d.id; })
        .style("text-anchor", "middle");
        else 
        text.attr("dx", function(d) {return (size(d.size)||nominal_base_node_size);})
        .text(function(d) { return '\u2002'+d.name; });*/

    // Features on mouseover <<Mode Joli>>@LucasCousi
    node.on("mouseover", function(d) {
        set_highlight(d);
    })
    .on("mousedown", function(d) { d3.event.stopPropagation();
        focus_node = d;
        //set_focus(d)
        if (highlight_node === null) set_highlight(d)
    })
    .on("mouseout", function(d) {
        exit_highlight();
    });

    // Random shit
    d3.select(window).on("mouseup", function() {
        if (focus_node!==null){
            focus_node = null;
            if (highlight_trans<1){
                //circle.style("opacity", 1);
                //text.style("opacity", 1);
                link.style("opacity", 1);
            }
        }
        if (highlight_node === null) exit_highlight();
    });

// Function highlighting
function exit_highlight(){
    highlight_node = null;
    if (focus_node===null){
        svg.style("cursor","default");
        if (highlight_color!="white"){
            //circle.style(towhite, "white");
            //text.style("font-weight", "normal");
            link.style("stroke",default_link_color);
        }
            
    }
}

/*function set_focus(d){   
    if (highlight_trans<1) {
        circle.style("opacity", function(o){
            return isConnected(d, o) ? 1 : highlight_trans;
        });
        text.style("opacity", function(o) {
            return isConnected(d, o) ? 1 : highlight_trans;
        });        
        link.style("opacity", function(o) {
            return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans;
        });     
    }
}*/


function set_highlight(d){
    svg.style("cursor","pointer");
    if (focus_node!==null) d = focus_node;
    highlight_node = d;
    if (highlight_color!="white"){
        //circle.style(towhite, function(o) {
          //  return isConnected(d, o) ? highlight_color : "white";});
        //text.style("font-weight", function(o) {
            //return isConnected(d, o) ? "bold" : "normal";});
        link.style("stroke", function(o) {
            return o.source.index == d.index || o.target.index == d.index ? highlight_color : ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);
        });
    }
}
    
// Zoom feature - if(zoom.modified = true) then kill;    
    zoom.on("zoom", function() {
        g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    });
    
    svg.call(zoom).on("dblclick.zoom", null);     
    
    resize();
    //window.focus();
    //d3.select(window).on("resize", resize).on("keydown", keydown);
    
    // Apply forces on graph  
    force.on("tick", function() {
        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        //text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });

// Adjust window size on screen
function resize() {

    var width = window.innerWidth, height = window.innerHeight;
    svg.attr("width", width).attr("height", height);
    
    force.size([force.size()[0]+(width-w)/zoom.scale(),force.size()[1]+(height-h)/zoom.scale()]).resume();
    w = width;
    h = height;

}

// Can use keyboard too    
/*function keydown() {
    if (d3.event.keyCode==32) {  force.stop();}
    else if (d3.event.keyCode>=48 && d3.event.keyCode<=90 && !d3.event.ctrlKey && !d3.event.altKey && !d3.event.metaKey){
        switch (String.fromCharCode(d3.event.keyCode)) {
            case "C": keyc = !keyc; break;
            case "S": keys = !keys; break;
            case "T": keyt = !keyt; break;
            case "R": keyr = !keyr; break;
            case "X": keyx = !keyx; break;
            case "D": keyd = !keyd; break;
            case "L": keyl = !keyl; break;
            case "M": keym = !keym; break;
            case "H": keyh = !keyh; break;
            case "1": key1 = !key1; break;
            case "2": key2 = !key2; break;
            case "3": key3 = !key3; break;
            case "0": key0 = !key0; break;
        }
    
        link.style("display", function(d) {
            var flag  = vis_by_type(d.source.type)&&vis_by_type(d.target.type)&&vis_by_node_score(d.source.score)&&vis_by_node_score(d.target.score)&&vis_by_link_score(d.score);
            linkedByIndex[d.source.index + "," + d.target.index] = flag;
            return flag?"inline":"none";
        });
        node.style("display", function(d) {
            return (key0||hasConnections(d))&&vis_by_type(d.type)&&vis_by_node_score(d.score)?"inline":"none";
        });
        text.style("display", function(d) {
            return (key0||hasConnections(d))&&vis_by_type(d.type)&&vis_by_node_score(d.score)?"inline":"none";
        });
                    
        if (highlight_node !== null){
            if ((key0||hasConnections(highlight_node))&&vis_by_type(highlight_node.type)&&vis_by_node_score(highlight_node.score)) { 
                if (focus_node!==null) set_focus(focus_node);
                set_highlight(highlight_node);
            }
            else {exit_highlight();}
        }

    }   
}*/

// End of d3 call
});
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}