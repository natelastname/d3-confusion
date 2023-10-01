var $ = require("jquery");
var d3 = require("d3");

function autoBox() {
    document.body.appendChild(this);
    const {x, y, width, height} = this.getBBox();
    document.body.removeChild(this);
    return [x, y, width, height];
}


function chart(rows, cols, accessor) {
    const width = 256;
    const height = 256;
    const margin = {left: 100, top: 100, bottom: 0, right: 0};
    let color_fn = d3.scaleSequentialSqrt(t => d3.interpolateReds(t))
    let color_tp = d3.scaleSequentialSqrt(t => d3.interpolateBlues(t))

    var w = width - margin.left - margin.right;
    var h = width - margin.top - margin.bottom;

    w = h;

    const matrix = rows.map(target =>
        cols.map(source => ({ source, target, val: accessor({ source, target }) }))
    );

    color_fn.domain([0, d3.max(matrix.flat().map(d => Number(d.val)))]);
    color_tp.domain([0, d3.max(matrix.flat().map(d => Number(d.val)))]);

    function colored(d) {
        const val = d.val;
        if (val === "UNAVAILABLE") return "lime";
        if (val === "NA") return "#ccc";
        if (d.source == d.target) return color_tp(+val);
        if (+val > 0) return color_fn(+val);
        return "white";
    }

    var row_scale = d3
        .scaleBand()
        .rangeRound([0, h])
        .paddingInner(0.0)
        .align(0)
        .domain(rows);

    var col_scale = d3
        .scaleBand()
        .rangeRound([0, (h / rows.length)*cols.length])
        .paddingInner(0.0)
        .align(0)
        .domain(cols);


    let main_svg = d3.select("#matContainer")
        .append("svg")
        .attr("id", "main_svg")
        .attr("class", "matrixdiagram")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom);

    // text label for the axis
    main_svg.append("text")
        .attr("x", width/2 )
        .attr("y", -31 )
        .style("text-anchor", "middle")
        .text("Predicted Class");

    main_svg.append("text")
        .attr("x", -height/2 )
        .attr("y", -31 )
        .attr('transform','rotate(270)')
        .style("text-anchor", "middle")
        .text("Actual Class");

    var row_line = main_svg
        .selectAll("g.row")
        .data(matrix)
        .enter()
        .append("g")
        .attr("transform", function(d){
            let yval = row_scale(d[0].target);
            return `translate(0, ${yval})`;
        })
        .each(makeRow);

    // The row labels
    var row = row_line
        .append("text")
        .attr("class", "label")
        .attr("x", -4)
        .attr("y", row_scale.bandwidth() / 2)
        .attr("dy", "0.32em")
        .text(function(d){
            return d[0].target;
        });


    // The col labels
    var column = main_svg
        .selectAll("g.column")
        .data(cols)
        .enter()
        .append("text")
        .attr("class", "column label")
        .attr("transform", function(d){
            return `translate(${col_scale(d)},0) rotate(-90)`;
        })
        .attr("x", 4)
        .attr("y", col_scale.bandwidth() / 2)
        .attr("dy", "0.32em")
        .text(function(d){
            return d;
        });

    function makeRow(rowData) {
        var cell = d3
            .select(this)
            .selectAll("rect")
            .data(rowData)
            .enter()
            .append("rect")
            .attr("x", d => col_scale(d.source))
            .attr("width", row_scale.bandwidth())
            .attr("height", row_scale.bandwidth())
            .attr("class","cell")
            .style("fill-opacity", 1)
            .style("fill", colored);

        cell.on("mouseover", function(d, i) {
            d3.selectAll('.cell').style("opacity","0.1");
            d3.selectAll('.cell')
                .filter(function(e){
                    return e.target == d.currentTarget.__data__.target;
                })
                .style("opacity","1")
                .style("stroke","#ccc")
                .style("stroke-width","1");

            d3.selectAll('.cell')
                .filter(function(e){
                    return e.source == d.currentTarget.__data__.source;
                })
                .style("opacity","1")
                .style("stroke","#ccc")
                .style("stroke-width","1");

            d3.selectAll('.cell')
                .filter(e => e.target == d.target)
                .style("opacity","1")
                .style("stroke","#000")
                .style("stroke-width","0.5");

            d3.selectAll('.cell')
                .filter(e => e.source == d.source)
                .style("opacity","1")
                .style("stroke","#000")
                .style("stroke-width","0.5");


            d3.selectAll('.cell')
                .filter(e => (e.target == d.target & e.source == d.source) | (e.source == d.target & e.target == d.source))
                .style("stroke","#000")
                .style("stroke-width","3");

            row
                .filter(e => e[0].source === d.source)
                .style("fill", "#000")
                .style("font-weight", "bold");
            column
                .filter(e => e[0].source === d.target)
                .style("fill", "#000")
                .style("font-weight", "bold");
        })
            .on("mouseout", () => {
                d3.selectAll('.cell')
                    .style("opacity","1")
                    .style("stroke-width","0");
                row.style("fill", null).style("font-weight", null);
                column.style("fill", null).style("font-weight", null);
            });
        cell.append("title").text(d => d.val);
    }
    // The autoBox function adjusts the SVG's viewBox to the dimensions of its contents.
    const bbox = main_svg.attr("viewBox", autoBox).node();
    document.getElementById("matContainer").appendChild(bbox);

}
function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
};


function access(row, col){
    return getRandomInt(0, 100);
}


$(document).ready(function(){
    //let rows = ["a", "b", "c", "d"];
    //let cols = ["a", "b", "c"];
    let rows = ["row1", "row2", "row3", "row4"];
    let cols = ["col1", "col2", "col3"];

    chart(rows, cols, access);
});
