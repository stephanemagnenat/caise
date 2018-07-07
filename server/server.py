#!/usr/bin/env python3.6

# inspired from https://websockets.readthedocs.io/en/stable/intro.html
# WS server example

import asyncio
import json
import logging
import websockets
import time
import numpy as np

from constants import *
from utils import *
from gameobjects import *

# enable logging

logging.basicConfig(level=logging.DEBUG)

# game state

class GameState:
	def __init__(self):
		self.players = {}
		self.boxes = {}
		self.ball = Ball(0)
		self.next_gameobject_id = 1

state = GameState()

## message building

def message_object_new(gameobject):
	message = gameobject.get_json_state(True)
	message['type'] = 'object_new'
	return json.dumps(message)

def message_object_status(gameobject):
	message = gameobject.get_json_state(False)
	message['type'] = 'object_state'
	return json.dumps(message)

def message_object_part(gameobject):
	return json.dumps({'type': 'object_part', 'id': gameobject.id})

def message_player_welcome(player):
	return json.dumps({'type': 'player_welcome', 'id': player.id})

## notification helper methods

async def notify_players(source_player, messager_builder_function):
	if state.players:       # asyncio.wait doesn't accept an empty list
		message = messager_builder_function(source_player)
		await asyncio.wait([websocket.send(message) for websocket in state.players])

## network processing callbacks

async def register(websocket):
	# receive the name from this player
	name = await websocket.recv()
	# TODO: check for name duplications
	player = Player(name, state.next_gameobject_id)
	player.pos[1] = 10
	websocket.send(message_player_welcome(player))
	state.next_gameobject_id += 1
	# send the current state to this player
	if state.ball:
		await websocket.send(message_object_new(state.ball))
	for other_websocket, other_player in state.players.items():
		await websocket.send(message_object_new(other_player))
	# add to the list of players
	state.players[websocket] = player
	# tell all players about this new one
	await notify_players(player, message_object_new)
	# print and return
	print(f"> {name} connected")
	return player

async def unregister(websocket):
	# remove from the list of players
	player = state.players[websocket]
	del state.players[websocket]
	# tell others players about this disconnection
	await notify_players(player, message_object_part)
	print(f"> {player.name} disconnected")

## client processing code

async def process_client(websocket, path):
	# register(websocket) sends user_event() to websocket
	player = await register(websocket)
	try:
		# process messages from this player
		async for message in websocket:
			data = json.loads(message)
			if data['action'] == 'move':
				# set the speed of the player
				player.move(data['speed'], 0.1)
			elif data['action'] == 'weapon_trigger':
				cur_time = time.time()
				#if cur_time - player.last_fire_time < TIME_BETWEEN_FIRE:
					## we are not allowed to fire
					#continue
				## see if any other player has been hit
				#did_hit = False
				#for other_websocket, other_player in players.items():
					#if other_player == player:
						#continue
					## if we hit the other
					#if np.linalg.norm(other_player.pos - player.pos) < DIST_TO_HIT:
						#did_hit = True
						## increase our score
						#player.score += 1
						## disable fire for other
						#other_player.last_fire_time = cur_time
				## if we did hit, update the client
				#if did_hit:
					#await notify_players(player, message_object_status)
				#player.last_fire_time = cur_time
			elif data['action'] == 'power_trigger':
				logging.info("Got power trigger, unimplemented yet")
			else:
				logging.error("unsupported event: {}", data)
	finally:
		await unregister(websocket)

## server-side state update

async def run_state():
	last_time = time.time()
	while True:
		# main game logic loop
		cur_time = time.time()
		delta_time = cur_time - last_time

		# ball collision
		if state.ball is not None and state.ball.step(delta_time, cur_time):
			await notify_players(state.ball, message_object_status)

		# loop over players
		for websocket, player in state.players.items():

			# collisions with walls
			if player.step(delta_time, cur_time):
				await notify_players(player, message_object_status)

			# ball fetching
			fetch_ball = False
			if state.ball and player.does_collide(state.ball):
				player.has_ball = True
				await notify_players(player, message_object_status)
				await notify_players(state.ball, message_object_part)
				state.ball = None

			# collision with other player
			for _, other in state.players.items():
				if player == other:
					continue
				deinterlace_vector = np.empty(2)
				if player.does_collide(other, deinterlace_vector):

					# save previous state
					prev_player_pos = player.pos
					prev_other_pos = other.pos
					prev_player_speed = player.speed
					prev_other_speed = other.speed
					prev_player_velocity = np.inner(player.speed, player.speed)
					prev_other_velocity = np.inner(other.speed, other.speed)
					player_had_ball = player.has_ball
					other_had_ball = other.has_ball
					player_was_stunned = player.is_stunned(cur_time)
					other_was_stunned = other.is_stunned(cur_time)

					# handle deinterlacing
					player.pos += deinterlace_vector * 0.5
					other.pos -= deinterlace_vector * 0.5

					# apply collision, reduce speed and stun
					player.speed = 0.5 * prev_other_speed
					other.speed = 0.5 * prev_player_speed
					#player.speed_cmd = player.speed
					#other.speed_cmd = other.speed
					player_velocity = np.inner(player.speed, player.speed)
					other_velocity = np.inner(other.speed, other.speed)
					player.last_time_stunned = other.last_time_stunned = time.time()

					# loose ball
					if player_had_ball:
						player.has_ball = False
						player.score -= 1
						state.ball = Ball(0)
						u = unitv(deinterlace_vector)
						state.ball.pos = player.pos + u * (player.r + state.ball.r + BALL_DROP_DIST)
						state.ball.speed = player.speed + u * BALL_DROP_VELOCITY
					if other_had_ball:
						other.has_ball = False
						other.score -= 1
						state.ball = Ball(0)
						u = unitv(deinterlace_vector)
						state.ball.pos = other.pos + u * -(other.r + state.ball.r + BALL_DROP_DIST)
						state.ball.speed = other.speed + u * -BALL_DROP_VELOCITY

					# notify when necessary
					## ball creation
					if player_had_ball or other_had_ball:
						await notify_players(state.ball, message_object_new)

					### player state changed
					if (player_had_ball or
						dist(player.pos, prev_player_pos) > MIN_DIST_TO_NOTIFY or
						abs(player_velocity - prev_player_velocity) > MIN_DELTA_VELOICTY_TO_NOTIFY):
						await notify_players(player, message_object_status)
					## other state changed
					if (other_had_ball or
						dist(other.pos, prev_other_pos) > MIN_DIST_TO_NOTIFY or
						abs(other_velocity - prev_other_velocity) > MIN_DELTA_VELOICTY_TO_NOTIFY):
						await notify_players(other, message_object_status)
		last_time = cur_time
		await asyncio.sleep(UPDATE_PERIOD)

## main code

loop = asyncio.get_event_loop()
loop.run_until_complete(websockets.serve(process_client, '', 6789))
loop.run_until_complete(run_state())
