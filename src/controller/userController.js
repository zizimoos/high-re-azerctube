import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const handleGetJoin = (req, res) => {
  return res.render("createAccount", { pageTitle: "create account" });
};

export const handlePostJoin = async (req, res) => {
  const { email, username, password, password2, name, location } = req.body;
  const exists = await User.exists({ $or: [{ username }, { email }] });

  if (password !== password2) {
    return res.status(400).render("createAccount", {
      pageTitle: "create account",
      errorMessage: "Password confirmation does not match",
    });
  }
  if (exists) {
    return res.status(400).render("createAccount", {
      pageTitle: "create account",
      errorMessage: "Username or email already exists",
    });
  }
  try {
    await User.create({ email, username, password, name, location });

    return res.redirect("/login");
  } catch (e) {
    console.log(e);
    return res.status(400).render("createAccount", {
      pageTitle: "join",
      errorMessage: e._message,
    });
  }
};

export const handleGetLogin = (req, res) => {
  return res.render("login", { pageTitle: "login" });
};

export const handlePostLogin = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const user = await User.findOne({ email, socialOnly: false });
    if (!user) {
      return res.status(400).render("login", {
        pageTitle: "Login",
        errorMessage: "An account with this email does not exists",
      });
    } else {
      const pass = await bcrypt.compare(password, user.password);
      if (!pass) {
        return res.status(400).render("login", {
          pageTitle: "Login",
          errorMessage: "An account with this pass does not exists",
        });
      }
      if (username !== user.username) {
        return res.status(400).render("login", {
          pageTitle: "Login",
          errorMessage: "An account with this username does not exists",
        });
      }

      req.session.user = user;
      req.session.loggedIn = true;

      return res.redirect("/");
    }
  } catch (e) {
    return res.status(400).render("login", {
      pageTitle: "login",
      errorMessage: e._message,
    });
  }
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GITHUB_CLIENTID,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const { code } = req.query;
  const config = {
    client_id: process.env.GITHUB_CLIENTID,
    client_secret: process.env.GITHUB_SECRET,
    code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const userRequest = await (
      await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const userEmails = await (
      await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObject = userEmails.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObject) {
      return res.redirect("/login");
    }

    let user = await User.findOne({ email: emailObject.email });
    if (!user) {
      user = await User.create({
        name: userRequest.name,
        email: emailObject.email,
        avatarUrl: userRequest.avatar_url,
        password: "",
        socialOnly: true,
        username: userRequest.login,
        location: userRequest.location,
      });
    }
    req.session.user = user;
    req.session.loggedIn = true;

    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const handleLogout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const handleGetEdit = (req, res) => {
  res.render("editProfile", { pageTitle: "Edit - profile" });
};

export const handlePostEdit = async (req, res) => {
  const {
    session: {
      user: { _id: id, avatarUrl },
    },
    body: { email, username, name, location },
    file: { path },
  } = req;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        avatarUrl: path ? path : avatarUrl,
        email,
        username,
        name,
        location,
      },
      { new: true }
    );
    req.session.user = user;
    return res.redirect(`/user/${id}`);
  } catch (e) {
    console.log(e);
    return res.status(400).render("editProfile", {
      pageTitle: "Edit - profile",
      errorMessage: "이미 사용자가 있습니다.",
    });
  }
};

export const handleGetChangePassword = (req, res) => {
  return res.render("user/change-password", { pageTitle: "ChangePassword" });
};

export const handlePostChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id: id },
    },
    body: { oldPassword, newPassword, confirmPassword },
  } = req;

  if (newPassword !== confirmPassword) {
    return res.status(400).render("user/change-password", {
      pageTitle: "change password",
      errorMessage: "Password confirmation does not match",
    });
  }

  const user = await User.findById(id);
  const pass = await bcrypt.compare(oldPassword, user.password);
  try {
    if (!pass) {
      return res.status(400).render("user/change-password", {
        pageTitle: "change password",
        errorMessage: "oldPassword is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.redirect("/user/logout");
  } catch (e) {
    console.log(e);
  }
};

export const handleGetProfile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }
  return res.render("user/profile", {
    pageTitle: user.username,
    user,
    videos: user.videos,
  });
};

export const handleRemove = (req, res) => res.send("USER DELETE");
export const handleSee = (req, res) => res.send("USER SEE");
