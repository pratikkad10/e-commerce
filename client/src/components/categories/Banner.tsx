import { Button } from "../ui/button"

const Banner = (props: {
  image: string
  sectionName: string
  description: string
  onClick: () => void
  flip?: boolean
}) => {
  const flipLayout = props.flip ?? false

  return (
    <section className="min-h-[60vh] md:h-[70vh] bg-gradient-to-br from-background via-muted/30 to-background border-b border-border relative overflow-hidden">

      <div className="h-full py-8 md:py-0">
        <div className="md:hidden flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center gap-4 sm:gap-6">
          <img
            src={props.image}
            alt="banner"
            loading="lazy"
            className="h-[40%] sm:h-[35%] max-h-[250px] object-contain"
          />
          <div className="flex flex-col gap-3 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground/90">
              {props.sectionName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs sm:max-w-md px-2">
              {props.description}
            </p>
            <Button
              onClick={props.onClick}
              className="px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold mx-auto"
            >
              Shop Now
            </Button>
          </div>
        </div>

        <div className={`hidden md:flex items-center justify-between h-full px-6 md:px-8 lg:px-16 xl:px-24 ${flipLayout ? 'flex-row-reverse' : ''}`}>
          
          <div className={`flex flex-col justify-center max-w-md lg:max-w-lg xl:max-w-xl gap-4 lg:gap-6 w-full md:w-[50%] ${flipLayout ? "text-right items-end" : "text-left items-start"}`}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground/90">
              {props.sectionName}
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">
              {props.description}
            </p>
            <Button
              onClick={props.onClick}
              className="px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 text-base md:text-lg lg:text-xl"
            >
              Shop Now
            </Button>
          </div>

          <div className={`flex justify-center items-center w-full md:w-[50%]`}>
            <img
              src={props.image}
              alt="banner"
              loading="lazy"
              className="h-[60%] md:h-[65%] lg:h-[70%] xl:h-[75%] max-w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
