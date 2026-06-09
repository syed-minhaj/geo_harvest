function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-md bg-muted ${className}`} />
    );
}

export function FieldsLoader() {
    return (
        <div className='flex flex-col gap-4 p-4 max-w-4xl mx-auto w-full'>
            {[...Array(2)].map((_, i) => (
                <div key={i} className='rounded-[0.75rem] border-1 bg-white dark:bg-secondary/15 shadow-sm overflow-hidden flex flex-col'>
                    <div className='flex flex-row'>
                        <div className='bg-green-50 dark:bg-green-950/20 border-r border-border flex flex-col items-center justify-center gap-3 p-4 shrink-0'>
                            <Skeleton className='w-[148px] h-[130px] rounded-md' />
                            <div className='flex flex-col gap-1 w-[148px]'>
                                <Skeleton className='h-3 w-full rounded' />
                                <Skeleton className='h-3 w-full rounded' />
                            </div>
                        </div>
                        <div className='flex flex-col gap-3 p-4 flex-1'>
                            <div className='flex items-start justify-between gap-2'>
                                <div className='flex flex-col gap-1.5'>
                                    <Skeleton className='h-5 w-32 rounded' />
                                    <Skeleton className='h-3 w-40 rounded' />
                                </div>
                                <div className='flex gap-1.5'>
                                    <Skeleton className='h-6 w-16 rounded-full' />
                                    <Skeleton className='h-6 w-20 rounded-full' />
                                </div>
                            </div>
                            <div className='grid grid-cols-4 gap-2'>
                                {[...Array(4)].map((_, j) => (
                                    <Skeleton key={j} className='h-14 rounded-md' />
                                ))}
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <Skeleton className='h-3 w-full rounded' />
                                <Skeleton className='h-3 w-full rounded' />
                                <Skeleton className='h-3 w-full rounded' />
                            </div>
                        </div>
                    </div>
                    <div className='grid grid-cols-3 border-t border-border'>
                        {[...Array(3)].map((_, j) => (
                            <div key={j} className={`flex flex-col gap-1.5 px-4 py-3 ${j > 0 ? 'border-l border-border' : ''}`}>
                                <Skeleton className='h-3 w-16 rounded' />
                                <Skeleton className='h-3 w-24 rounded' />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}