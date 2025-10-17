import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"

const Banner2 = () => {

    const navigate = useNavigate();
    return (
        <div className="lg:h-[100vh] mt-16 lg:mt-0 py-4 overflow-hidden">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-12 lg:px-24 xl:px-40">
                <div className="flex items-center gap-4 md:gap-8 lg:gap-10">
                    <div className="flex justify-center flex-shrink-0 basis-[45%] sm:basis-1/2">
                        <img className="h-56 sm:h-72 md:h-[60vh] lg:h-[100vh] max-h-[100vh] w-auto rounded-lg sm:rounded-xl object-cover" loading="lazy" src="/women.png" alt="Fashion Model" />
                    </div>

                    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 px-2 sm:px-0 basis-[55%] sm:basis-1/2 min-w-0 break-words">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-bold tracking-widest [writing-mode:vertical-lr] rotate-180">FASHION</p>
                            <p className="text-xs text-muted-foreground">Discover the latest trends in modern fashion</p>
                            <p className="text-xs text-muted-foreground font-semibold">COLLECTION 2025</p>
                        </div>

                        <div className="flex flex-col leading-tight">
                            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-foreground/90">REIMAGINE</h1>
                            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-foreground/90">EVERYDAY</h1>
                        </div>

                        <div>
                            <Button
                                onClick={() => navigate('/shop')}
                                size="lg" className="px-8">
                                Shop Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Banner2