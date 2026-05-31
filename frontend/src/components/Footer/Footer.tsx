const footerLinks = [
	{
		title: "EXPLORE",
		links: ["Contact Us", "Privacy Policy", "Rosetta Journal"],
	},
	{
		title: "INSTITUTION",
		links: ["IIT Ropar Main Site", "Terms of Service", "Lab Guidelines"],
	},
]

function Footer() {
	return (
		<footer className="border-t border-border bg-card text-card-foreground">
			<div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-6 py-10 md:grid-cols-3">
				<div>
					<h2 className="mb-3 font-display text-[20px] font-bold leading-tight text-foreground sm:text-[24px]">
						Rogāre
					</h2>
					<p className="max-w-xs text-[13px] leading-6 text-muted-foreground">
						A crowdsourced FAQ solution portal developed by the VINS interns of VLED, IIT Ropar. Summer 2026.
					</p>
				</div>

				{footerLinks.map((section) => (
					<div key={section.title}>
						<p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
							{section.title}
						</p>
						<ul className="space-y-2">
							{section.links.map((link) => (
								<li key={link}>
									<a
										className="text-[13px] leading-6 text-muted-foreground transition-colors hover:text-foreground"
										href="#top"
									>
										{link}
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
			<div className="mx-auto max-w-[1200px] border-t border-border/40 px-6 py-6 text-center">
				<p className="text-[12px] leading-6 text-muted-foreground">
					© 2026 — {__PROJECT_OWNER__ || 'Vicharanashala Lab for Education of Design (VLED), Indian Institute of Technology Ropar'}. All rights reserved.
				</p>
			</div>
		</footer>
	)
}

export default Footer
