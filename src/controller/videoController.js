import User from "../models/User";
import Video from "../models/Video";

export const handleHome = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ createdAt: "desc" })
      .populate("owner");
    return res.render("home", { pageTitle: "home", videos });
  } catch (err) {
    res.render("database - error", { err });
  }
};

export const handleWatch = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const video = await Video.findById(id).populate("owner");
    res.render("watch", {
      pageTitle: `${video.title}`,
      video,
    });
  } catch (error) {
    console.log(error);
    return res.render("404", {
      pageTitle: "Video not found",
    });
  }
};

export const handleGetEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  try {
    return res.render("video/edit", {
      pageTitle: `Editing : ${video.title}`,
      video,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).render("404", {
      pageTitle: "Video not found",
    });
  }
};

export const handlePostEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.findOne({ _id: id });
  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "page not found",
    });
  }

  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  try {
    await Video.findByIdAndUpdate(id, {
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect(`/video/${id}`);
  } catch (error) {
    console.log(error);
    return res.status(400).render("video/edit", {
      pageTitle: "edit",
      errorMessage: error._message,
    });
  }
};

export const handleDelete = async (req, res) => {
  const {
    params: { id },
  } = req;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "page not found",
    });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  try {
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
};

export const handleSearch = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  try {
    videos = await Video.find({
      title: { $regex: new RegExp(keyword, "i") },
    }).populate("owner");
    return res.render("search", { pageTitle: "Search", videos });
  } catch (error) {
    console.log(error);
    return res.redirect("/search");
  }
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "upload" });
};

export const postUpload = async (req, res) => {
  const {
    session: {
      user: { _id: owner },
    },
    body: { title, description, hashtags },
    files: { video, thumb },
  } = req;
  try {
    const newVideo = await Video.create({
      title,
      owner,
      description,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(owner);
    user.videos.push(newVideo._id);
    await user.save();
    return res.redirect(`/`);
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "upload",
      errorMessage: error._message,
    });
  }
};

export const registerView = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return sendStatus(404);
  }
  video.meta.views += 1;
  await video.save();
  return res.sendStatus(200);
};
