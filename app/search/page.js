import Catalog from '@/components/Catalog'
export default function P({searchParams}){return<Catalog q={searchParams.q||''}/>}
