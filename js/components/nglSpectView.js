/**
 * Created by rgillams on 25/02/2019.
 */

import {Stage, Shape, concatStructures, Selection, DatasourceRegistry, StaticDatasource} from "ngl";
import React from "react";
import {connect} from "react-redux";

export class NGLSpectView extends React.Component {
    constructor(props) {
        super(props);
        // Create NGL Stage object
        this.div_id = "viewport";
        this.height = "600px";
        this.interval = 300;
        this.focus_var = 95;
        this.stage = undefined;
        this.orientationToSet = {};
        this.getData = this.getData.bind(this);
        this.addElement = this.addElement.bind(this);
        this.createElement = this.createElement.bind(this);
        this.createSelect = this.createSelect.bind(this);
        this.createFileButton = this.createFileButton.bind(this);
        this.isolevelScroll = this.isolevelScroll.bind(this);
        this.loadStructure = this.loadStructure.bind(this);
        this.load2fofc = this.load2fofc.bind(this);
        this.loadFofc = this.loadFofc.bind(this);
        this.checkSele = this.checkSele.bind(this);
        this.applySele = this.applySele.bind(this);
        this.loadExample = this.loadExample.bind(this);
        this.nglData = undefined;
        this.edmapUrl = "https://edmaps.rcsb.org/maps/";
        this.scroll2fofc = undefined;
        this.scrollFofc = undefined;
        this.struc = undefined;
        this.surf2fofc = undefined;
        this.surfFofc = undefined;
        this.surfFofcNeg = undefined;
        this.exampleSelect = undefined;
        this.fileStructureText = undefined;
    }

    getData() {
        this.nglData = new DatasourceRegistry.add("data", new StaticDatasource("//cdn.rawgit.com/arose/ngl/v2.0.0-dev.32/data/"));
    }

    addElement(el) {
        Object.assign(el.style, {
            position: "absolute",
            zIndex: 10
        })
        this.stage.viewer.container.appendChild(el)
    }

    createElement(name, properties, style) {
        var el = document.createElement(name);
        Object.assign(el, properties);
        Object.assign(el.style, style);
        return el;
    }


    createSelect(options, properties, style) {
        var select = this.createElement("select", properties, style);
        options.forEach(function (d) {
            select.add(this.createElement("option", {
                value: d[0], text: d[1]
            }))

        });
        return select;
    }

    createFileButton(label, properties, style) {
        var input = this.createElement("input", Object.assign({
            type: "file"
        }, properties), {display: "none"})
        this.addElement(input)
        var button = this.createElement("input", {
            value: label,
            type: "button",
            onclick: function () {
                input.click()
            }
        }, style)
        return button
    }

    isolevelScroll(stage, delta) {
        var d = Math.sign(delta) / 10
        this.stage.eachRepresentation(function (reprElem, comp) {
            var p
            if (this.scroll2fofc && reprElem === this.surf2fofc) {
                p = reprElem.getParameters()
                reprElem.setParameters({isolevel: Math.max(0.01, p.isolevel + d)})
            } else if (this.scrollFofc && (reprElem === this.surfFofc || reprElem === this.surfFofcNeg)) {
                p = reprElem.getParameters()
                reprElem.setParameters({isolevel: Math.max(0.01, p.isolevel + d)})
            }
        })
    }

    loadStructure(input) {
        this.struc = undefined;
        this.surf2fofc = undefined;
        this.surfFofc = undefined;
        this.surfFofcNeg = undefined;
        file2fofcText.innerText = "2fofc file: none";
        fileFofcText.innerText = "fofc file: none";
        isolevel2fofcText.innerText = "";
        isolevelFofcText.innerText = "";
        boxSizeRange.value = 10;
        seleInput.value = "";
        this.stage.setFocus(0);
        this.stage.removeAllComponents();
        return this.stage.loadFile(input).then(function (o) {
            this.fileStructureText.innerText = "structure file: " + o.name
            this.struc = o
            o.autoView();
            o.addRepresentation("line", {
                colorValue: "yellow",
                multipleBond: "offset",
                bondSpacing: 1.1,
                linewidth: 6
            });
            o.addRepresentation("point", {
                colorValue: "yellow",
                sizeAttenuation: false,
                pointSize: 6,
                alphaTest: 1,
                useTexture: true
            })
        })
    }

    load2fofc(input) {
        return this.stage.loadFile(input).then(function (o) {
            file2fofcText.innerText = "2fofc file: " + o.name
            isolevel2fofcText.innerText = "2fofc level: 1.5\u03C3"
            boxSizeRange.value = 10
            scrollSelect.value = "2fofc"
            this.scroll2fofc = true
            if (this.surfFofc) {
                isolevelFofcText.innerText = "fofc level: 3.0\u03C3"
                this.surfFofc.setParameters({isolevel: 3, boxSize: 10, contour: true, isolevelScroll: false})
                this.surfFofcNeg.setParameters({isolevel: 3, boxSize: 10, contour: true, isolevelScroll: false})
            }
            this.surf2fofc = o.addRepresentation("surface", {
                color: "skyblue",
                isolevel: 1.5,
                boxSize: 10,
                useWorker: false,
                contour: true,
                opaqueBack: false,
                isolevelScroll: false
            })
        })
    }

    loadFofc(input) {
        return this.stage.loadFile(input).then(function (o) {
            fileFofcText.innerText = "fofc file: " + o.name
            isolevelFofcText.innerText = "fofc level: 3.0\u03C3"
            boxSizeRange.value = 10
            scrollSelect.value = "2fofc"
            this.scrollFofc = false
            if (this.surf2fofc) {
                isolevel2fofcText.innerText = "2fofc level: 1.5\u03C3"
                this.surf2fofc.setParameters({isolevel: 1.5, boxSize: 10, contour: true, isolevelScroll: false})
            }
            this.surfFofc = o.addRepresentation("surface", {
                color: "mediumseagreen",
                isolevel: 3,
                boxSize: 10,
                useWorker: false,
                contour: true,
                opaqueBack: false,
                isolevelScroll: false
            })
            this.surfFofcNeg = o.addRepresentation("surface", {
                color: "tomato",
                isolevel: 3,
                negateIsolevel: true,
                boxSize: 10,
                useWorker: false,
                contour: true,
                opaqueBack: false,
                isolevelScroll: false
            })
        })
    }

    checkSele(str) {
        var selection = new NGL.Selection(str)
        return !selection.selection["error"]
    }

    applySele(value) {
        if (value) {
            lastSele = value
            this.struc.autoView(value)
            var z = this.stage.viewer.camera.position.z
            this.stage.setFocus(100 - Math.abs(z / 10))
        }
    }

    loadExample(id) {
        var pl
        if (id === "3ek3") {
            pl = [
                this.loadStructure("data://3ek3.cif"),
                this.load2fofc("data://3ek3-2fofc.map.gz"),
                this.loadFofc("data://3ek3-fofc.map.gz")
            ]
        } else if (id === "3nzd") {
            pl = [
                this.loadStructure("data://3nzd.cif"),
                this.load2fofc("data://3nzd.ccp4.gz"),
                this.loadFofc("data://3nzd_diff.ccp4.gz")
            ]
        } else if (id === "1lee") {
            pl = [
                this.loadStructure("data://1lee.pdb"),
                this.load2fofc("data://1lee.ccp4"),
                this.loadFofc("data://1lee_diff.ccp4")
            ]
        }
        this.exampleSelect.value = ""
        return Promise.all(pl)
    }

    componentWillMount() {
        this.stage = new Stage(this.div_id);
    }

    componentDidMount() {
        this.stage = new Stage(this.div_id);
        // Handle window resizing
        var local_stage = this.stage;
        window.addEventListener("resize", function (event) {
            local_stage.handleResize();
        }, false);
        // this.stage.mouseControls.add("clickPick-left",this.showPick);
        this.stage.setParameters({cameraType: "orthographic", mousePreset: "coot"});
        this.stage.mouseControls.add("scroll", this.isolevelScroll)
        this.stage.mouseControls.add("scroll", function () {
            if (this.surf2fofc) {
                var level2fofc = this.surf2fofc.getParameters().isolevel.toFixed(1)
                isolevel2fofcText.innerText = "2fofc level: " + level2fofc + "\u03C3"
            }
            if (this.surfFofc) {
                var levelFofc = this.surfFofc.getParameters().isolevel.toFixed(1)
                isolevelFofcText.innerText = "fofc level: " + levelFofc + "\u03C3"
            }
        });

        var dict = ["": "load example", "3ek3": "3ek3", "3nzd": "3nzd", "1lee": "1lee"];
        var exampleSelect = this.createSelect(dict,
            {
                onchange: function (e) {
                    var id = e.target.value
                    this.loadExample(id).then(function () {
                        if (id === "3nzd") {
                            seleInput.value = "NDP"
                        } else if (id === "1lee") {
                            seleInput.value = "R36 and (.C28 or .N1)"
                        }
                        this.applySele(seleInput.value)
                    })
                }
            },
            {top: "84px", left: "12px"}
        );

        this.addElement(exampleSelect);

        var seleText = this.createElement("span", {
                innerText: "center selection",
                title: "press enter to apply and center"
            },
            {top: "114px", left: "12px", color: "lightgrey"}
        );

        this.addElement(seleText);

        var seleInput = this.createElement("input", {
                type: "text",
                title: "press enter to apply and center",
                onkeypress: function (e) {
                    var value = e.target.value
                    var character = String.fromCharCode(e.which)
                    if (e.keyCode === 13) {
                        e.preventDefault()
                        if (this.checkSele(value)) {
                            if (this.struc) {
                                this.applySele(value)
                            }
                            e.target.style.backgroundColor = "white"
                        } else {
                            e.target.style.backgroundColor = "tomato"
                        }
                    } else if (lastSele !== value + character) {
                        e.target.style.backgroundColor = "skyblue"
                    } else {
                        e.target.style.backgroundColor = "white"
                    }
                }
            },
            {top: "134px", left: "12px", width: "120px"}
        );

        this.addElement(seleInput);

        // var surfaceSelect = this.createSelect([
        //             ["contour", "contour"],
        //             ["wireframe", "wireframe"],
        //             ["smooth", "smooth"],
        //             ["flat", "flat"]
        //         ], {
        //             onchange: function (e) {
        //                 var v = e.target.value
        //                 var p
        //                 if (v === "contour") {
        //                     p = {
        //                         contour: true,
        //                         flatShaded: false,
        //                         opacity: 1,
        //                         metalness: 0,
        //                         wireframe: false
        //                     }
        //                 } else if (v === "wireframe") {
        //                     p = {
        //                         contour: false,
        //                         flatShaded: false,
        //                         opacity: 1,
        //                         metalness: 0,
        //                         wireframe: true
        //                     }
        //                 } else if (v === "smooth") {
        //                     p = {
        //                         contour: false,
        //                         flatShaded: false,
        //                         opacity: 0.5,
        //                         metalness: 0,
        //                         wireframe: false
        //                     }
        //                 } else if (v === "flat") {
        //                     p = {
        //                         contour: false,
        //                         flatShaded: true,
        //                         opacity: 0.5,
        //                         metalness: 0.2,
        //                         wireframe: false
        //                     }
        //                 }
        //                 this.stage.getRepresentationsByName("surface").setParameters(p)
        //             }
        //         },
        //         {top: "170px", left: "12px"}
        //     );
        //
        // this.addElement(surfaceSelect);

        var toggle2fofcButton = this.createElement("input", {
                type: "button",
                value: "toggle 2fofc",
                onclick: function (e) {
                    this.surf2fofc.toggleVisibility()
                }
            },
            {top: "194px", left: "12px"}
        );

        this.addElement(toggle2fofcButton);

        var toggleFofcButton = this.createElement("input", {
                type: "button",
                value: "toggle fofc",
                onclick: function (e) {
                    this.surfFofc.toggleVisibility()
                    this.surfFofcNeg.toggleVisibility()
                }
            },
            {top: "218px", left: "12px"}
        );

        this.addElement(toggleFofcButton);

        this.addElement(this.createElement("span", {innerText: "box size"}, {
            top: "242px",
            left: "12px",
            color: "lightgrey"
        }))

        var boxSizeRange = this.createElement("input", {
                type: "range",
                value: 10,
                min: 1,
                max: 50,
                step: 1,
                oninput: function (e) {
                    this.stage.getRepresentationsByName("surface").setParameters({
                            boxSize: parseInt(e.target.value)
                        }
                    )
                }
            },
            {top: "258px", left: "12px"}
        );

        this.addElement(boxSizeRange);

        var screenshotButton = this.createElement("input", {
                type: "button",
                value: "screenshot",
                onclick: function () {
                    this.stage.makeImage({
                        factor: 1,
                        antialias: false,
                        trim: false,
                        transparent: false
                    }).then(function (blob) {
                        NGL.download(blob, "ngl-xray-viewer-screenshot.png")
                    })
                }
            }, {top: "282px", left: "12px"}
        );

        this.addElement(screenshotButton);

        // var scrollSelect = this.createSelect([
        //         ["2fofc", "scroll 2fofc"],
        //         ["fofc", "scroll fofc"],
        //         ["both", "scroll both"]
        //     ], {
        //         onchange: function (e) {
        //             var v = e.target.value;
        //             if (v === "2fofc") {
        //                 this.scroll2fofc = true,
        //                     this.scrollFofc = false
        //             } else if (v === "fofc") {
        //                 this.scroll2fofc = false,
        //                     this.scrollFofc = true
        //             } else if (v === "both") {
        //                 this.scroll2fofc = true,
        //                     this.scrollFofc = true
        //             }
        //         }
        //     },
        //     {top: "306px", left: "12px"}
        // );
        //
        // this.addElement(scrollSelect)

        var loadEdmapText = this.createElement("span", {
                innerText: "load edmap for pdb id",
                title: "press enter to load"
            },
            {top: "330px", left: "12px", color: "lightgrey"}
        );

        this.addElement(loadEdmapText)

        var loadEdmapInput = this.createElement("input", {
                type: "text",
                title: "press enter to load",
                onkeypress: function (e) {
                    var value = e.target.value
                    if (e.keyCode === 13) {
                        e.preventDefault()
                        this.loadStructure("rcsb://" + value)
                        this.load2fofc(this.edmapUrl + value + "_2fofc.dsn6")
                        this.loadFofc(this.edmapUrl + value + "_fofc.dsn6")
                    }
                }
            },
            {top: "350px", left: "12px", width: "120px"}
        )

        this.addElement(loadEdmapInput)

        var isolevel2fofcText = this.createElement(
            "span", {}, {bottom: "32px", left: "12px", color: "lightgrey"}
        )

        this.addElement(isolevel2fofcText)

        var isolevelFofcText = this.createElement(
            "span", {}, {bottom: "12px", left: "12px", color: "lightgrey"}
        )

        this.addElement(isolevelFofcText)
        this.addElement(isolevelFofcText)

        var fileStructureText = this.createElement("span", {
            innerText: "structure file: none"
        }, {bottom: "52px", right: "12px", color: "lightgrey"})

        this.addElement(fileStructureText)

        var file2fofcText = this.createElement("span", {
            innerText: "2fofc file: none"
        }, {bottom: "32px", right: "12px", color: "lightgrey"})

        this.addElement(file2fofcText)

        var fileFofcText = this.createElement("span", {
            innerText: "fofc file: none"
        }, {bottom: "12px", right: "12px", color: "lightgrey"})

        this.addElement(fileFofcText)
    }

    componentDidUpdate(){
    }

    render() {
        DatasourceRegistry.add("data", new StaticDatasource("//cdn.rawgit.com/arose/ngl/v2.0.0-dev.32/data/"));
        // _ngl.DatasourceRegistry._dict.data.baseUrl

        var loadStructureButton = this.createFileButton("load structure", {
                accept: ".pdb,.cif,.ent,.gz",
                onchange: function (e) {
                    if (e.target.files[0]) {
                        this.exampleSelect.value = ""
                        this.loadStructure(e.target.files[0])
                    }
                }
            },
            {top: "12px", left: "12px"}
        );

        this.addElement(loadStructureButton);

        var load2fofcButton = this.createFileButton("load 2fofc", {
                accept: ".map,.ccp4,.brix,.dsn6,.mrc,.gz",
                onchange: function (e) {
                    if (e.target.files[0]) {
                        this.load2fofc(e.target.files[0])
                    }
                }
            },
            {top: "36px", left: "12px"}
        );

        this.addElement(load2fofcButton);

        var loadFofcButton = this.createFileButton("load fofc", {
                accept: ".map,.ccp4,.brix,.dsn6,.mrc,.gz",
                onchange: function (e) {
                    if (e.target.files[0]) {
                        loadFofc(e.target.files[0])
                    }
                }
            },
            {top: "60px", left: "12px"}
        );

        this.addElement(loadFofcButton);

        return <div style={{height: this.height}} id={this.div_id}></div>
    }
}

function mapStateToProps(state) {
  return {
  }
}
const mapDispatchToProps = {
}
export default connect(mapStateToProps, mapDispatchToProps)(NGLSpectView);