function on(id, name) {
  document.getElementById("notif").style.display = "block";
  document.getElementById("nextdelete").setAttribute("href", `/delete/${id}`);
  document.getElementById(
    "ask"
  ).innerHTML = `Apakah kamu yakin akan menghapus data '${name}'?`;
}

function off() {
  document.getElementById("notif").style.display = "none";
}
