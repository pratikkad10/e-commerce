const Banner1 = () => {
    return (
        <div className=" py-6 ">
            <p className="lg:text-xl text-lg font-old-standard italic text-center text-foreground/60">Modern Fashion Asthetics</p>
            <h1 className="lg:text-6xl text-3xl font-birthstone text-center">We are Open</h1>

            <div className="pt-4">
                <div className="rounded-t-[14rem] overflow-hidden">
                    <img loading="lazy" src="/hanger-shirts.jpg"
                        className="h-150 w-full shadow-2xl"
                        alt="" />
                </div>
            </div>
        </div>
    )
}

export default Banner1
