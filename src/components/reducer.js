export default function(url){
	return <div 
		key={url.url} 
		style={{marginBottom:5}}
		dangerouslySetInnerHTML={{
			__html: `
				/** ${url.summary} */ <br/>
				export async function ${url.url.split("/")[1]}(data) { <br/>
					&nbsp;&nbsp;&nbsp;&nbsp;
					return request('${url.url}',data); <br />
				}
			`}}
	/>
}