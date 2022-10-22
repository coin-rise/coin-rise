import React, { useState } from "react";

function Form() {
  const [textTrack, setTextTrack] = useState("");

  function handleChange(e) {
    setTextTrack(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    for (let i = 0; i < e.target.length - 1; i++) {
      if (e.target[i].name === "checkbox") {
        console.dir(e.target[i].checked);
      } else if (e.target[i].name === "selectMultiple") {
        console.dir(
          Array.from(e.target[i].selectedOptions).map((o) => o.value)
        );
      } else {
        console.dir(e.target[i].value);
      }
    }
    console.log("submit");
  }

  return (
    <form className="Form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="text">Text </label>
        <input type="text" id="text" name="text" />
      </div>

      <div>
        <label htmlFor="text">Text track</label>
        <input
          type="text"
          id="textTrack"
          name="textTrack"
          value={textTrack}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="textArea">TextArea </label>
        <textarea type="text" id="textArea" name="textArea"></textarea>
      </div>

      <div>
        <label>Select </label>
        <select id="select" name="select">
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
        </select>
        {/* {select} */}
      </div>

      <div>
        <label>Select multiple </label>
        <select id="selectMultiple" name="selectMultiple" multiple>
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
        </select>
        {/* {selectMultiple} */}
      </div>

      <div>
        <label>Checkbox </label>
        <input id="checkbox" name="checkbox" type="checkbox"></input>
        {/* {checkbox ? <span>Checked !</span> : null} */}
      </div>

      <div>
        <button>Submit</button>
      </div>
    </form>
  );
}

export default Form;
