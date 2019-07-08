import { copy } from "../util/util";

export default function(url){
	return <div 
		key={url.url} 
		style={{marginBottom:5,cursor:"pointer"}}
		onClick={(e)=>copy(e.currentTarget.innerText)}
	>
		<div dangerouslySetInnerHTML={{
			__html: `
				/** ${url.summary} */ <br/>
				export async function ${url.alias}(data) { <br/>
					&nbsp;&nbsp;&nbsp;&nbsp;
					return request('${url.url}',data); <br />
				}
			`}} 
		/>
	</div>
}