import { firstToUpper, copy } from '../util/util';


export default function(url){
	return <div 
		key={url.url} 
		style={{marginBottom:5,cursor:'pointer'}}
		onClick={(e) => copy(e.currentTarget.innerText)}
		dangerouslySetInnerHTML={{
			__html: `
				/** ${url.summary} */ <br/>
				update${firstToUpper(url.alias)}(state,{${url.alias}}) { <br/>
					&nbsp;&nbsp;&nbsp;&nbsp;
					return {...state,${url.alias}}<br />
				},
			`}}
	/>
}