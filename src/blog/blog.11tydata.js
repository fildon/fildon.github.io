module.exports = {
	// Automatically compute absolute URL for each blog post
	absoluteUrl: (data) => {
		if (data.page && data.page.url) {
			return `https://rupertmckay.com${data.page.url}`;
		}
		return "https://rupertmckay.com";
	},

	// Compute permalink with date prefix stripped (already handled by blog.json)
	// but this makes it available as computed data

	// Set default social image if not specified
	socialImage: (data) => {
		return (
			data.socialImage ||
			"https://raw.githubusercontent.com/fildon/train-ride/main/train-ride.png"
		);
	},
};
