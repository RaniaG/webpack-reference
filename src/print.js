import _ from "lodash";
export default function printMe() {
  const x = _.join(["Hello", "webpack"], " ");
  alert("I get called from print.js!" + x);
}
