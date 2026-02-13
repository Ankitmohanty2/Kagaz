

export const PdfViewer = ({ fileUrl }: { fileUrl: string }) => {
    return (
        <div className="h-full bg-slate-50 rounded-2xl border border-border overflow-hidden relative shadow-inner">
            <iframe
                src={fileUrl + "#toolbar=0"}
                height="100%"
                width="100%"
                className='border-none h-[calc(100vh-8rem)] w-full'
            />
        </div>
    )
}