(window.webpackJsonp=window.webpackJsonp||[]).push([[66],{134:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return l})),n.d(t,"metadata",(function(){return i})),n.d(t,"toc",(function(){return c})),n.d(t,"default",(function(){return b}));var a=n(3),r=n(7),o=(n(0),n(146)),s=["components"],l={title:"50 ways to crash our product",author:"Andre Bogus",author_title:"Chief Rustacean",author_url:"https://github.com/getsynth",author_image_url:"https://avatars.githubusercontent.com/u/4200835?v=4",tags:["synth","testing","story"],description:"Trying to break our own code for fun and profit",image:"https://storage.googleapis.com/getsynth-public/media/crash.svg",hide_table_of_contents:!1},i={permalink:"/synth/blog/2021/09/27/crash",source:"@site/blog/2021-09-27-crash.md",description:"Trying to break our own code for fun and profit",date:"2021-09-27T00:00:00.000Z",tags:[{label:"synth",permalink:"/synth/blog/tags/synth"},{label:"testing",permalink:"/synth/blog/tags/testing"},{label:"story",permalink:"/synth/blog/tags/story"}],title:"50 ways to crash our product",readingTime:9.68,truncated:!1,nextItem:{title:"So you want to mock an API",permalink:"/synth/blog/2021/09/07/mocking-a-production-api"}},c=[{value:"Overview",id:"overview",children:[]}],p={toc:c};function b(e){var t=e.components,n=Object(r.a)(e,s);return Object(o.b)("wrapper",Object(a.a)({},p,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,Object(o.b)("img",{parentName:"p",src:"https://storage.googleapis.com/getsynth-public/media/crash.svg",alt:"50 ways to crash our product"})),Object(o.b)("p",null,"I personally think that the software we build should make more people's lives better than it makes worse. So when users recently started filing bug reports, I read them with mixed feelings. On one hand, it meant that those particular users were actually using ",Object(o.b)("a",{parentName:"p",href:"https://getsynth.com"},"synth"),", on the other hand, it also meant that we were failing to give them a polished experience. So when it was my turn to write more stuff about what we do here, I set myself a challenge: Find as many ways as I can to break our product."),Object(o.b)("p",null,"I briefly considered fuzzing, but decided against it. It felt like cheating. Where's the challenge in that? Also, I wanted to be sure that the bugs would be reachable by ordinary (or perhaps at least exceptional) users, and would accept misleading error messages (that a fuzzer couldn't well decide) as bugs. Finally I am convinced I learn more about some code when actively trying to break it, and that's always a plus. So \"let's get cracking!\" I quoth and off I went."),Object(o.b)("h3",{id:"overview"},"Overview"),Object(o.b)("p",null,"Before we start, I should perhaps consider giving a short architectural overview on synth. Basically the software has four parts:"),Object(o.b)("ol",null,Object(o.b)("li",{parentName:"ol"},"The DSL (which is implemented by a set of types in ",Object(o.b)("inlineCode",{parentName:"li"},"core/src/schema")," that get deserialized from JSON),"),Object(o.b)("li",{parentName:"ol"},"a compiler that creates a ",Object(o.b)("inlineCode",{parentName:"li"},"graph")," (which form a directed acyclic graph of items that can generate values),"),Object(o.b)("li",{parentName:"ol"},"export (writing to the data sink) and"),Object(o.b)("li",{parentName:"ol"},"import facilities (for creating a synth namespace from a database schema)")),Object(o.b)("p",null,"My plan was to look at each of the components and see if I can find inputs to break them in interesting ways. For example, leaving out certain elements or putting incorrect JSON data (that would not trip up the deserialization part, but lead to incorrect compilation later on) might be a fruitful target. Starting from an empty schema:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-json",metastring:"synth",synth:!0},'{\n    "type": "array",\n    "length": 1,\n    "content": {\n        "type": "object"\n    }\n}\n')),Object(o.b)("p",null,"I then called out ",Object(o.b)("inlineCode",{parentName:"p"},"synth generate")," until finding a problem. First, I attempted to insert confusing command line arguments, but the ",Object(o.b)("a",{parentName:"p",href:"https://docs.rs/clap"},"clap"),"-based parser handled all of them gracefully. Kudos!"),Object(o.b)("p",null,"#","1 The first thing I tried is using a negative length:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-json",metastring:"synth",synth:!0},'{\n    "type": "array",\n    "length": -1,\n    "content": {\n        "type": "object"\n    }\n}\n')),Object(o.b)("p",null,"Which was met with ",Object(o.b)("inlineCode",{parentName:"p"},'BadRequest: could not convert from value \'i64(-1)\': Type { expected: "U32", got: "i64(-1)" }'),". Not exactly a crash, but the error message could be friendlier and have more context. I should note that this is a very unspecialized error variant within the generator framework. It would make sense to validate this before compiling the generator and emit a more user-friendly error."),Object(o.b)("p",null,Object(o.b)("em",{parentName:"p"},"Bonus"),": If we make the length ",Object(o.b)("inlineCode",{parentName:"p"},'"optional": true')," (which could happen because of a copy & paste error), depending on the seed, we will get another ",Object(o.b)("inlineCode",{parentName:"p"},"BadRequest")," error. The evil thing is that this will only happen with about half of the seeds, so you may or may not be lucky here (or may even become unlucky if another version would slightly change the seed handling)."),Object(o.b)("p",null,"#","2 Changing the ",Object(o.b)("inlineCode",{parentName:"p"},"length")," field to ",Object(o.b)("inlineCode",{parentName:"p"},"{}")," makes for another befuddling error:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-console"},"Error: Unable to open the namespace\n\nCaused by:\n    0: at file 2_unitlength/unitlength.json\n    1: Failed to parse collection\n    2: missing field `type` at line 8 column 1\n")),Object(o.b)("p",null,"The line number is wrong here, the length should be in line six in the ",Object(o.b)("inlineCode",{parentName:"p"},"content")," object, not in line eight."),Object(o.b)("p",null,"#","3 It's not that long that we can use literal numbers for number constants here (for example given the ",Object(o.b)("inlineCode",{parentName:"p"},"length"),"). The old way would use a ",Object(o.b)("a",{parentName:"p",href:"https://www.getsynth.com/docs/content/number"},Object(o.b)("inlineCode",{parentName:"a"},"number"))," generator. A recent improvement let us generate arbitrary numbers, however this is likely not a good idea for a ",Object(o.b)("inlineCode",{parentName:"p"},"length")," field:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-json",metastring:"synth",synth:!0},'{\n    "type": "array",\n    "length": {\n        "type": "number",\n        "subtype": "u32"\n    },\n    "content": {\n        "type": "object"\n    }\n}\n')),Object(o.b)("p",null,"This might be done very quickly, but far more likely it will work for a long time, exhausing memory in the process, because this actually generates a whole lot of empty objects (which are internally ",Object(o.b)("inlineCode",{parentName:"p"},"BTreeMap"),"s, so an empty one comes at 24 bytes) \u2013 up to 4.294.967.295 of them, which would fill 96GB! While this is not an error per se, we should probably at least warn on this mistake. We could also think about streaming the result instead of storing it all in memory before writing it out, at least unless there are references that need to be stored, and this would also allow us to issue output more quickly."),Object(o.b)("p",null,"#","4 Let's now add a ",Object(o.b)("inlineCode",{parentName:"p"},"string"),":"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-json",metastring:"synth",synth:!0},'{\n    "type": "array",\n    "length": {\n        "type": "number",\n        "subtype": "u32"\n    },\n    "content": {\n        "type": "object",\n        "s": {\n            "type": "string"\n        }\n    }\n}\n')),Object(o.b)("p",null,"Oops, I forgot to specify which kind of string. But I wouldn't know that from the error:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-console"},"Error: Unable to open the namespace\n\nCaused by:\n    0: at file 4_unknownstring/unknownstring.json\n    1: Failed to parse collection\n    2: invalid value: map, expected map with a single key at line 10 column 1\n")),Object(o.b)("p",null,"#","5 Ok, let's make that a ",Object(o.b)("a",{parentName:"p",href:"https://www.getsynth.com/docs/content/string#format"},Object(o.b)("inlineCode",{parentName:"a"},"format"))," then. However, I forgot that the ",Object(o.b)("inlineCode",{parentName:"p"},"format"),'must contains a map with the keys "format" and "arguments", putting them into the ',Object(o.b)("inlineCode",{parentName:"p"},"s")," map directly:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-json",metastring:"synth",synth:!0},'{\n    "type": "array",\n    "length": {\n        "type": "number",\n        "subtype": "u32"\n    },\n    "content": {\n        "type": "object",\n        "s": {\n            "type": "string",\n            "format": "say my {name}",\n            "arguments": {\n                "name": "name"\n            }\n        }\n    }\n}\n')),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-console"},"Error: Unable to open the namespace\n\nCaused by:\n    0: at file 5_misformat/misformat.json\n    1: Failed to parse collection\n    2: invalid value: map, expected map with a single key at line 14 column 1\n")),Object(o.b)("p",null,"#","6 Ok, then let's try to use a faker. Unfortunately, I haven't really read the docs, so I'll just try the first thing that comes to mind:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-json",metastring:"synth",synth:!0},'{\n    "type": "array",\n    "length": {\n        "type": "number",\n        "subtype": "u32"\n    },\n    "content": {\n        "type": "object",\n        "name": {\n            "type": "string",\n            "faker": "name"\n        }\n    }\n}\n')),Object(o.b)("p",null,"This gets us:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-console"},'Error: Unable to open the namespace\n\nCaused by:\n    0: at file empty/empty.json\n    1: Failed to parse collection\n    2: invalid type: string "name", expected struct FakerContent at line 11 column 1\n')),Object(o.b)("p",null,"One could say that the error is not exactly misleading, but not exactly helpful either. As I've tried a number of things already, I'll take it. Once I get the syntax right (",Object(o.b)("inlineCode",{parentName:"p"},'"faker": { "generator": "name" }'),", the rest of the faker stuff seems to be rock solid."),Object(o.b)("p",null,"#","7 Trying to mess up with ",Object(o.b)("inlineCode",{parentName:"p"},"date_time"),", I mistakenly specify a date format for a ",Object(o.b)("inlineCode",{parentName:"p"},"naive_time")," value. "),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-json",metastring:"synth",synth:!0},'{\n   "type": "array",\n   "length": 1,\n   "content": {\n       "type": "object",\n       "date": {\n       "type": "string",\n           "date_time": {\n          "format": "%Y-%m-%d",\n          "subtype": "naive_time",\n          "begin": "1999-01-01",\n          "end": "2199-31-12"\n        }\n      }\n       }\n   }\n}\n')),Object(o.b)("p",null,"This gets me the following error which is again misplaced at the end of the input, and not exactly understandable. The same happens if I select a date format of ",Object(o.b)("inlineCode",{parentName:"p"},'"%H"')," and bounds of ",Object(o.b)("inlineCode",{parentName:"p"},"0")," to ",Object(o.b)("inlineCode",{parentName:"p"},"23"),"."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-console"},"Error: Unable to open the namespace\n\nCaused by:\n    0: at file 7_datetime/datetime.json\n    1: Failed to parse collection\n    2: input is not enough for unique date and time at line 16 column 1\n")),Object(o.b)("p",null,"I believe since the time is not constrained in any way by the input, we should just issue a warning and generate an unconstrained time instead, so the user will at least get ",Object(o.b)("em",{parentName:"p"},"some")," data. Interestingly, seconds seem to be optional, so ",Object(o.b)("inlineCode",{parentName:"p"},"%H:%M")," works."),Object(o.b)("p",null,"#","8 More, if I use ",Object(o.b)("inlineCode",{parentName:"p"},"naive_date")," instead, but make the minimum ",Object(o.b)("inlineCode",{parentName:"p"},"0-0-0"),", we get the technically correct but still mis-spanned:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-console"},"Error: Unable to open the namespace\n\nCaused by:\n    0: at file 8_endofdays/endofdays.json\n    1: Failed to parse collection\n    2: input is out of range at line 16 column 1s\n")),Object(o.b)("p",null,"For the record, the error is on line 11."),Object(o.b)("p",null,"#","9 Now we let ",Object(o.b)("inlineCode",{parentName:"p"},"date_time")," have some rest and go on to ",Object(o.b)("a",{parentName:"p",href:"https://www.getsynth.com/docs/content/string#categorical"},Object(o.b)("inlineCode",{parentName:"a"},"categorical")),". Having just one variant with a weight of ",Object(o.b)("inlineCode",{parentName:"p"},"0")," will actually trigger an ",Object(o.b)("inlineCode",{parentName:"p"},"unreachable")," error:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-json"},'{\n    "type": "array",\n    "length": 1,\n    "content": {\n        "type": "object",\n        "cat": {\n            "type": "string",\n            "categorical": {\n                "empty": 0\n            }\n        }\n    }\n}\n')),Object(o.b)("p",null,"Well, the code thinks we should not be able to reach it. Surprise!"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-console"},"thread 'main' panicked at 'internal error: entered unreachable code', /home/andre/projects/synth/core/src/schema/content/categorical.rs:82:9\nnote: run with `RUST_BACKTRACE=1` environment variable to display a backtrace\n")),Object(o.b)("p",null,"For the record, this is the first internal error I was able to uncover so far. Given this success with categorical strings, it was natural to look if ",Object(o.b)("inlineCode",{parentName:"p"},"one_of")," could be similarly broken, but the generator just chose the one variant despite its ",Object(o.b)("inlineCode",{parentName:"p"},"0.0")," weight."),Object(o.b)("p",null,"#","10 Unsupported types on import"),Object(o.b)("p",null,"Databases can sometimes contain strange things, and so far the support is in beta, so it was expected that I would find types for which we currently don't implement import. This includes JSON for mysql and postgres, the mysql spatial datatypes as well as postgres' geometric types, user-defined enumerations, postgres' network address types, postgres arrays (soon only nested ones), etc."),Object(o.b)("p",null,"The way to reproduce that is to create a table with a field of the type, e.g. here with mysql"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-sql"},'CREATE TABLE IF NOT EXISTS json (\n    data JSON\n);\n\nDELETE FROM json;\n\nINSERT INTO json (data) VALUES (\'{ "a": ["b", 42] }\');\n')),Object(o.b)("p",null,"Now call ",Object(o.b)("inlineCode",{parentName:"p"},"synth import jsonnamespace --from mysql://<user>:<password>@<host>:<port>/<database>")," to get"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-console"},"Error: We haven't implemented a converter for json\n")),Object(o.b)("p",null,"Since the error is mostly the same for all types, and was somewhat expected, I won't claim a point for each type here."),Object(o.b)("p",null,"#","11 Exporting an array of nulls into postgres is not correctly implemented, so"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-json",metastring:"synth",synth:!0},'{\n    "type": "array",\n    "length": 5,\n    "content": {\n        "type": "object",\n        "s": {\n            "type": "array",\n            "length": 1,\n            "content": {\n                "type": "null"\n            }\n        }\n    }\n}\n')),Object(o.b)("p",null,"will give us a ",Object(o.b)("inlineCode",{parentName:"p"},"wrong data type")," error from postgres. The problem here is that we lose the type information from the generator, and just emit ",Object(o.b)("inlineCode",{parentName:"p"},"null")," values which do not allow us to construct the right types for encoding into a postgres buffer. The solution would be to re-architect the whole system to reinstate that type information, possibly side-stepping sqlx in the process. Note that this is not equal to ",Object(o.b)("a",{parentName:"p",href:"https://github.com/getsynth/synth/issues/171"},"issue #171"),", which relates to nested arrays."),Object(o.b)("p",null,"#","12 going back to ","#","3, I thought about other ways to make the code overconsume resources. But time and memory are only one thing to consume, in fact it's easy enough to consume another: The stack. The following bash script:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-bash"},'X=\'{ "type": "null" }\'\n\nfor i in $(seq 0 4096)\ndo\n    X="{ \\"type\\": \\"string\\", \\"format\\": { \\"format\\": \\"{x}\\", \\"arguments\\": { \\"x\\": $X } } }"\ndone\n\necho $X > 12_stack_depth/stack_depth.json\nsynth gen --size 1 12_stack_depth\n')),Object(o.b)("p",null,"will generate the following error:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-console"},"Error: Unable to open the namespace\n\nCaused by:\n    0: at file 12_stack_depth/stack_depth.json\n    1: Failed to parse collection\n    2: recursion limit exceeded at line 1 column 2929\n")),Object(o.b)("p",null,"So I give up. I've found 1 way to crash our product with an unintended error, reproduced some known limitations and outlined a number of error messages we can improve on. I fell far short of my original goal, which either means I'm really bad at finding errors, or our code is incredibly reliable. Given the track record of software written in Rust, I'd like to think it's the latter, but I'll leave judgement to you."),Object(o.b)("p",null,"Anyway, this was a fun exercise and I looked at many more things that turned out to just work well, so that's a good thing\u2122. With all the test automation we have today, it's easy to forget that the manual approach also has its upsides. So feel free and try to break your (or our) code!"))}b.isMDXComponent=!0},146:function(e,t,n){"use strict";n.d(t,"a",(function(){return b})),n.d(t,"b",(function(){return m}));var a=n(0),r=n.n(a);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var c=r.a.createContext({}),p=function(e){var t=r.a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},b=function(e){var t=p(e.components);return r.a.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},h=r.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),b=p(n),h=a,m=b["".concat(s,".").concat(h)]||b[h]||u[h]||o;return n?r.a.createElement(m,l(l({ref:t},c),{},{components:n})):r.a.createElement(m,l({ref:t},c))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,s=new Array(o);s[0]=h;var l={};for(var i in t)hasOwnProperty.call(t,i)&&(l[i]=t[i]);l.originalType=e,l.mdxType="string"==typeof e?e:a,s[1]=l;for(var c=2;c<o;c++)s[c]=n[c];return r.a.createElement.apply(null,s)}return r.a.createElement.apply(null,n)}h.displayName="MDXCreateElement"}}]);